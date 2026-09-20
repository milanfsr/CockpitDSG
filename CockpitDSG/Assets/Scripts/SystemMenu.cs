using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

public class SystemMenu : MonoBehaviour
{
    [Header("Panels")]
    public GameObject systemListPanel;
    public GameObject tileOptionsPanel;

    [Header("System List")]
    public Transform systemListContent;
    public GameObject systemButtonPrefab;

    [Header("Tile Options")]
    public Button moveButton;
    public Button removeButton;
    public TMP_Text tileOptionsTitle;

    // Always-available reference to placement controller
    private PlacementController placement;
    private List<SystemData> allSystems = new List<SystemData>();

    void Awake()
    {
        Hide();
    }

    // Call this once at start from PlacementController
    public void Init(PlacementController ctrl)
    {
        placement = ctrl;
    }

    public void SetSystems(List<SystemData> systems)
    {
        allSystems = systems;
    }

    // ── System list ───────────────────────────────────────────────────────────

    public void Show()
    {
        systemListPanel.SetActive(true);
        tileOptionsPanel.SetActive(false);
        gameObject.SetActive(true);
        PopulateList();
    }

    public void Hide()
    {
        gameObject.SetActive(false);
        systemListPanel.SetActive(false);
        tileOptionsPanel.SetActive(false);
    }

    void PopulateList()
    {
        // Clear existing buttons
        foreach (Transform child in systemListContent)
            Destroy(child.gameObject);

        // Group by category
        var grouped = new Dictionary<SystemCategory, List<SystemData>>();
        foreach (var sys in allSystems)
        {
            if (!grouped.ContainsKey(sys.category))
                grouped[sys.category] = new List<SystemData>();
            grouped[sys.category].Add(sys);
        }

        foreach (var kvp in grouped)
        {
            // Category header
            GameObject header = new GameObject("Header_" + kvp.Key);
            header.transform.SetParent(systemListContent, false);
            TMP_Text headerText = header.AddComponent<TextMeshProUGUI>();
            headerText.text = kvp.Key.ToString();
            headerText.fontSize = 14;
            headerText.fontStyle = FontStyles.Bold;
            headerText.color = new Color(0.31f, 0.27f, 0.9f);
            LayoutElement le = header.AddComponent<LayoutElement>();
            le.preferredHeight = 30;

            // System buttons
            foreach (var sys in kvp.Value)
            {
                SystemData captured = sys;
                GameObject btnGO = Instantiate(systemButtonPrefab, systemListContent);
                TMP_Text label = btnGO.GetComponentInChildren<TMP_Text>();
                if (label != null) label.text = sys.displayName;

                Button btn = btnGO.GetComponent<Button>();
                btn.onClick.RemoveAllListeners();
                btn.onClick.AddListener(() =>
                {
                    if (placement != null)
                        placement.StartPlacing(captured);
                    else
                        Debug.LogError("SystemMenu: placement reference is null!");
                });
            }
        }
    }

    // ── Tile options ──────────────────────────────────────────────────────────

    public void ShowTileOptions(SystemTile tile, PlacementController ctrl)
    {
        placement = ctrl;
        systemListPanel.SetActive(false);
        tileOptionsPanel.SetActive(true);
        gameObject.SetActive(true);

        if (tileOptionsTitle != null)
            tileOptionsTitle.text = tile.Data.displayName;

        moveButton.onClick.RemoveAllListeners();
        moveButton.onClick.AddListener(() => ctrl.MoveSelectedTile());

        removeButton.onClick.RemoveAllListeners();
        removeButton.onClick.AddListener(() => ctrl.RemoveSelectedTile());
    }
}