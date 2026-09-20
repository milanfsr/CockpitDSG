using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;
using TMPro;

public enum PlacementMode { Free, Menu, Placing }

public class PlacementController : MonoBehaviour
{
    [Header("References")]
    public Camera playerCamera;
    public SystemMenu systemMenu;
    public GameObject ghostPrefab;

    [Header("Settings")]
    public LayerMask panelLayer;
    public float ghostHeightOffset = 0.005f;

    [Header("Ghost Materials")]
    public Material ghostValidMat;
    public Material ghostInvalidMat;

    [Header("Cursor & Nametag UI")]
    public Image crosshair;
    public GameObject nametagPanel;
    public TMP_Text nametagText;

    public PlacementMode Mode { get; private set; } = PlacementMode.Free;

    private SystemData selectedSystem;
    private GameObject ghostObject;
    private Renderer ghostRenderer;
    private PanelGrid hoveredPanel;
    private Vector2Int hoveredCell;
    private bool placementValid;
    private SystemTile selectedTile;
    private PlayerController playerController;
    private AIClient aiClient;

    // Resize state
    private SystemTile resizingTile;
    private int currentWidth  = 1;
    private int currentHeight = 1;

    void Start()
    {
        playerController = GetComponent<PlayerController>();
        if (playerCamera == null)
            playerCamera = GetComponentInChildren<Camera>();

        SystemData[] systems = Resources.LoadAll<SystemData>("Systems");
        systemMenu.SetSystems(new System.Collections.Generic.List<SystemData>(systems));
        systemMenu.Init(this);

        if (nametagPanel != null) nametagPanel.SetActive(false);

        aiClient = FindFirstObjectByType<AIClient>();
        if (aiClient != null)
        {
            aiClient.OnFeedbackReceived += (items) =>
            {
                Debug.Log($"[AI] Received {items.Count} feedback items:");
                foreach (var item in items)
                    Debug.Log($"[AI] [{item.severity}] {item.system_name}: {item.issue}");
            };
            aiClient.OnError += (err) => Debug.LogError($"[AI] Error: {err}");
        }
    }

    void Update()
    {
        var kb    = Keyboard.current;
        var mouse = Mouse.current;
        if (kb == null || mouse == null) return;

        if (kb.tabKey.wasPressedThisFrame)
        {
            if      (Mode == PlacementMode.Free)    OpenMenu();
            else if (Mode == PlacementMode.Menu)    CloseMenu();
            else if (Mode == PlacementMode.Placing) CancelPlacement();
        }

        if (Mode == PlacementMode.Placing)
        {
            UpdateGhost();
            HandleResizeScroll(kb, mouse);
            if (mouse.leftButton.wasPressedThisFrame && placementValid) ConfirmPlacement();
            if (mouse.rightButton.wasPressedThisFrame)                  CancelPlacement();
        }

        if (Mode == PlacementMode.Free)
        {
            if (mouse.leftButton.wasPressedThisFrame) TrySelectTile();
            UpdateNametag();
        }
    }

    // ── Menu ──────────────────────────────────────────────────────────────────

    void OpenMenu()
    {
        Mode = PlacementMode.Menu;
        systemMenu.Show();
        playerController?.UnlockCursor();
        if (nametagPanel != null) nametagPanel.SetActive(false);
    }

    void CloseMenu()
    {
        Mode = PlacementMode.Free;
        systemMenu.Hide();
        playerController?.LockCursor();
    }

    public void StartPlacing(SystemData system)
    {
        selectedSystem = system;
        currentWidth   = system.defaultWidth;
        currentHeight  = system.defaultHeight;
        Mode = PlacementMode.Placing;
        systemMenu.Hide();
        playerController?.LockCursor();

        if (ghostObject != null) Destroy(ghostObject);
        ghostObject   = Instantiate(ghostPrefab);
        ghostObject.SetActive(false);
        ghostRenderer = ghostObject.GetComponent<Renderer>();
        if (nametagPanel != null) nametagPanel.SetActive(false);
    }

    // ── Resize scroll ─────────────────────────────────────────────────────────

    void HandleResizeScroll(Keyboard kb, Mouse mouse)
    {
        if (!selectedSystem.resizable) return;

        float scroll = mouse.scroll.ReadValue().y;
        if (scroll == 0f) return;
        int delta = scroll > 0 ? 1 : -1;

        if (kb.shiftKey.isPressed)
        {
            currentHeight = Mathf.Clamp(
                currentHeight + delta,
                selectedSystem.minHeight,
                selectedSystem.maxHeight);
        }
        else if (kb.ctrlKey.isPressed)
        {
            currentWidth = Mathf.Clamp(
                currentWidth + delta,
                selectedSystem.minWidth,
                selectedSystem.maxWidth);
        }
    }

    // ── Ghost preview ─────────────────────────────────────────────────────────

    void UpdateGhost()
    {
        Ray ray = playerCamera.ScreenPointToRay(
            new Vector3(Screen.width / 2f, Screen.height / 2f, 0f));

        if (Physics.Raycast(ray, out RaycastHit hit, 10f, panelLayer))
        {
            PanelGrid panel = hit.collider.GetComponent<PanelGrid>();
            if (panel == null) panel = hit.collider.GetComponentInParent<PanelGrid>();

            if (panel != null)
            {
                hoveredPanel = panel;
                hoveredCell  = panel.WorldPositionToCell(hit.point);

                if (hoveredCell.x >= 0)
                {
                    placementValid = panel.CanPlace(
                        hoveredCell.x, hoveredCell.y,
                        currentWidth, currentHeight);

                    Vector3 footprintCentre = panel.GetFootprintCentre(
                        hoveredCell.x, hoveredCell.y,
                        currentWidth, currentHeight);

                    ghostObject.SetActive(true);
                    ghostObject.transform.position = footprintCentre +
                        panel.transform.up * ghostHeightOffset;
                    ghostObject.transform.rotation =
                        panel.transform.rotation * Quaternion.Euler(90f, 0f, 0f);

                    Vector2 cellSize = panel.GetCellWorldSize();
                    ghostObject.transform.localScale = new Vector3(
                        cellSize.x * currentWidth,
                        cellSize.y * currentHeight,
                        1f);

                    ghostRenderer.material = placementValid ? ghostValidMat : ghostInvalidMat;
                    return;
                }
            }
        }

        hoveredPanel   = null;
        placementValid = false;
        ghostObject?.SetActive(false);
    }

    // ── Placement ─────────────────────────────────────────────────────────────

    void ConfirmPlacement()
    {
        if (hoveredPanel == null || !placementValid) return;

        bool placed = hoveredPanel.PlaceSystem(
            selectedSystem.systemId,
            hoveredCell.x, hoveredCell.y,
            currentWidth, currentHeight);

        if (placed)
        {
            Vector3 centre = hoveredPanel.GetFootprintCentre(
                hoveredCell.x, hoveredCell.y,
                currentWidth, currentHeight);

            GameObject tileGO = new GameObject($"Tile_{selectedSystem.systemId}");
            tileGO.transform.position = centre + hoveredPanel.transform.up * ghostHeightOffset;
            tileGO.transform.rotation = hoveredPanel.transform.rotation;

            GameObject quad = GameObject.CreatePrimitive(PrimitiveType.Quad);
            Destroy(quad.GetComponent<Collider>());
            quad.transform.SetParent(tileGO.transform, false);
            quad.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);

            Vector2 cellSize = hoveredPanel.GetCellWorldSize();
            quad.transform.localScale = new Vector3(
                cellSize.x * currentWidth  * 0.95f,
                cellSize.y * currentHeight * 0.95f,
                1f);

            Renderer r   = quad.GetComponent<Renderer>();
            Material mat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            mat.color    = selectedSystem.tileColor;
            r.material   = mat;

            SystemTile tile = tileGO.AddComponent<SystemTile>();
            tile.Init(selectedSystem, hoveredPanel,
                hoveredCell.x, hoveredCell.y,
                currentWidth, currentHeight);

            BoxCollider col = tileGO.AddComponent<BoxCollider>();
            col.isTrigger = true;
            col.size = new Vector3(
                cellSize.x * currentWidth  * 0.95f,
                0.002f,
                cellSize.y * currentHeight * 0.95f);

            aiClient?.RequestFeedbackDelayed("placed");
        }
    }

    void CancelPlacement()
    {
        if (ghostObject != null) Destroy(ghostObject);
        ghostObject    = null;
        selectedSystem = null;
        hoveredPanel   = null;
        Mode = PlacementMode.Free;
        playerController?.LockCursor();
        aiClient?.RequestFeedbackDelayed("removed");
    }

    // ── Nametag ───────────────────────────────────────────────────────────────

    void UpdateNametag()
    {
        if (nametagPanel == null) return;

        Ray ray = playerCamera.ScreenPointToRay(
            new Vector3(Screen.width / 2f, Screen.height / 2f, 0f));

        if (Physics.Raycast(ray, out RaycastHit hit, 5f,
            ~0, QueryTriggerInteraction.Collide))
        {
            SystemTile tile = hit.collider.GetComponent<SystemTile>();
            if (tile == null) tile = hit.collider.GetComponentInParent<SystemTile>();

            if (tile != null)
            {
                nametagPanel.SetActive(true);
                if (nametagText != null)
                    nametagText.text = tile.Data.displayName;
                return;
            }
        }

        nametagPanel.SetActive(false);
    }

    // ── Tile selection ────────────────────────────────────────────────────────

    void TrySelectTile()
    {
        Ray ray = playerCamera.ScreenPointToRay(
            new Vector3(Screen.width / 2f, Screen.height / 2f, 0f));

        if (Physics.Raycast(ray, out RaycastHit hit, 5f,
            ~0, QueryTriggerInteraction.Collide))
        {
            SystemTile tile = hit.collider.GetComponent<SystemTile>();
            if (tile == null) tile = hit.collider.GetComponentInParent<SystemTile>();

            if (tile != null)
            {
                selectedTile = tile;
                systemMenu.ShowTileOptions(tile, this);
                playerController?.UnlockCursor();
                Mode = PlacementMode.Menu;
            }
        }
    }

    public void RemoveSelectedTile()
    {
        if (selectedTile == null) return;
        selectedTile.Remove();
        selectedTile = null;
        aiClient?.RequestFeedbackDelayed("removed");
        CloseMenu();
    }

    public void MoveSelectedTile()
    {
        if (selectedTile == null) return;
        SystemData data = selectedTile.Data;
        selectedTile.Remove();
        selectedTile = null;
        systemMenu.Hide();
        StartPlacing(data);
    }
}