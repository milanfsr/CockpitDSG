using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.InputSystem;
using TMPro;

/// <summary>
/// Assistant UI — bottom-right corner icon that expands into a chat/feedback panel.
/// Attach to a GameObject in your HUDCanvas.
/// </summary>
public class AssistantUI : MonoBehaviour
{
    [Header("References")]
    public AIClient aiClient;
    private PlayerController playerController;

    [Header("Icon Button")]
    public Button   iconButton;        // the bottom-right circle button
    public Image    iconImage;         // icon background — changes color on new feedback
    public TMP_Text badgeText;         // small number badge showing unread count

    [Header("Chat Panel")]
    public GameObject chatPanel;       // the expandable panel
    public Transform  messageContainer;// scroll content — messages go here
    public ScrollRect scrollRect;      // for auto-scrolling to latest message
    public TMP_InputField chatInput;   // text input field
    public Button     sendButton;      // send button

    [Header("Prefabs")]
    public GameObject feedbackMessagePrefab; // prefab: Panel with icon + TMP text
    public GameObject chatMessagePrefab;     // prefab: Panel with TMP text (user/assistant)

    [Header("Colors")]
    public Color iconIdleColor    = new Color(0.15f, 0.15f, 0.20f, 1f);
    public Color iconAlertColor   = new Color(0.80f, 0.30f, 0.10f, 1f);
    public Color iconOpenColor    = new Color(0.20f, 0.40f, 0.85f, 1f);
    [Header("Keybind")]
    public Key toggleKey = Key.F1; // change in Inspector if needed

    [Header("Severity Colors")]
    public Color severityHigh     = new Color(0.90f, 0.25f, 0.25f, 1f);
    public Color severityMedium   = new Color(0.95f, 0.65f, 0.10f, 1f);
    public Color severityLow      = new Color(0.25f, 0.70f, 0.40f, 1f);

    // ── State ─────────────────────────────────────────────────────────────────
    private bool  panelOpen  = false;
    private int   unreadCount = 0;
    private List<FeedbackItem> allFeedback = new List<FeedbackItem>();

    // Map system_id → tile for highlight on click
    private Dictionary<string, SystemTile> tileMap = new Dictionary<string, SystemTile>();

    void Start()
    {
        // Wire up events
        if (aiClient != null)
        {
            aiClient.OnFeedbackReceived += HandleFeedback;
            aiClient.OnChatReply        += HandleChatReply;
            aiClient.OnError            += HandleError;
        }

        playerController = FindFirstObjectByType<PlayerController>();
        iconButton?.onClick.AddListener(TogglePanel);
        sendButton?.onClick.AddListener(SendChatMessage);

        if (chatInput != null)
            chatInput.onSubmit.AddListener(_ => SendChatMessage());

        // Start closed
        chatPanel?.SetActive(false);
        UpdateBadge();
        SetIconColor(iconIdleColor);
    }

    // ── Toggle panel ──────────────────────────────────────────────────────────

    void Update()
    {
        if (Keyboard.current == null) return;

        // Open with toggle key (only when panel is closed and input not focused)
        if (!panelOpen && Keyboard.current[toggleKey].wasPressedThisFrame)
            OpenPanel();

        // Close with Escape
        if (panelOpen && Keyboard.current.escapeKey.wasPressedThisFrame)
            ClosePanel();

        // Send with Enter (only when input field is focused)
        if (panelOpen && chatInput != null && chatInput.isFocused
            && Keyboard.current.enterKey.wasPressedThisFrame)
            SendChatMessage();
    }

    void TogglePanel()
    {
        if (panelOpen) ClosePanel();
        else           OpenPanel();
    }

    void OpenPanel()
    {
        panelOpen = true;
        chatPanel?.SetActive(true);
        unreadCount = 0;
        UpdateBadge();
        SetIconColor(iconOpenColor);
        ScrollToBottom();

        // Block player movement while chat is open
        if (playerController != null) playerController.InputBlocked = true;

        // Focus the chat input so player can type immediately
        if (chatInput != null)
        {
            chatInput.ActivateInputField();
            chatInput.Select();
        }
    }

    void ClosePanel()
    {
        panelOpen = false;
        chatPanel?.SetActive(false);
        SetIconColor(iconIdleColor);

        // Restore player movement
        if (playerController != null) playerController.InputBlocked = false;

        // Deselect input so player regains camera control
        if (chatInput != null)
            chatInput.DeactivateInputField();
    }

    // ── Incoming feedback ─────────────────────────────────────────────────────

    void HandleFeedback(List<FeedbackItem> items)
    {
        if (items == null || items.Count == 0) return;

        // Refresh tile map
        RefreshTileMap();

        foreach (var item in items)
        {
            allFeedback.Add(item);
            SpawnFeedbackMessage(item);
            if (!panelOpen) unreadCount++;
        }

        UpdateBadge();
        if (!panelOpen)
            SetIconColor(iconAlertColor);
        else
            ScrollToBottom();
    }

    void SpawnFeedbackMessage(FeedbackItem item)
    {
        if (feedbackMessagePrefab == null || messageContainer == null) return;

        GameObject msg = Instantiate(feedbackMessagePrefab, messageContainer);

        // Severity icon
        TMP_Text iconText = msg.transform.Find("Icon")?.GetComponent<TMP_Text>();
        if (iconText != null)
            iconText.text = item.severity switch
            {
                "HIGH"   => "⚠",
                "MEDIUM" => "ℹ",
                _        => "○"
            };

        // Color the left border / background by severity
        Image bg = msg.GetComponent<Image>();
        if (bg != null)
            bg.color = item.severity switch
            {
                "HIGH"   => new Color(severityHigh.r,   severityHigh.g,   severityHigh.b,   0.15f),
                "MEDIUM" => new Color(severityMedium.r, severityMedium.g, severityMedium.b, 0.15f),
                _        => new Color(severityLow.r,    severityLow.g,    severityLow.b,    0.15f)
            };

        // System name
        TMP_Text nameText = msg.transform.Find("SystemName")?.GetComponent<TMP_Text>();
        if (nameText != null)
        {
            nameText.text  = item.system_name ?? item.system_id;
            nameText.color = item.severity switch
            {
                "HIGH"   => severityHigh,
                "MEDIUM" => severityMedium,
                _        => severityLow
            };
        }

        // Issue text
        TMP_Text issueText = msg.transform.Find("IssueText")?.GetComponent<TMP_Text>();
        if (issueText != null)
            issueText.text = item.issue;

        // Suggestion text
        TMP_Text suggText = msg.transform.Find("SuggestionText")?.GetComponent<TMP_Text>();
        if (suggText != null)
            suggText.text = string.IsNullOrEmpty(item.suggestion) ? "" : $"→ {item.suggestion}";

        // Regulation ref
        TMP_Text regText = msg.transform.Find("RegRef")?.GetComponent<TMP_Text>();
        if (regText != null)
        {
            regText.text    = item.regulation_ref ?? "";
            regText.gameObject.SetActive(!string.IsNullOrEmpty(item.regulation_ref));
        }

        // Click to highlight tile
        Button btn = msg.GetComponent<Button>();
        if (btn != null)
        {
            string sysId = item.system_id;
            btn.onClick.AddListener(() => HighlightTile(sysId));
        }
    }

    // ── Chat ──────────────────────────────────────────────────────────────────

    void SendChatMessage()
    {
        if (chatInput == null || string.IsNullOrWhiteSpace(chatInput.text)) return;
        string msg = chatInput.text.Trim();
        chatInput.text = "";

        // Show user message
        SpawnChatMessage(msg, isUser: true);
        ScrollToBottom();

        // Send to AI
        aiClient?.SendChatMessage(msg);
    }

    void HandleChatReply(string reply)
    {
        SpawnChatMessage(reply, isUser: false);
        if (!panelOpen) unreadCount++;
        UpdateBadge();
        ScrollToBottom();
    }

    void SpawnChatMessage(string text, bool isUser)
    {
        if (chatMessagePrefab == null || messageContainer == null) return;
        GameObject msg = Instantiate(chatMessagePrefab, messageContainer);

        TMP_Text label = msg.GetComponentInChildren<TMP_Text>();
        if (label != null) label.text = text;

        Image bg = msg.GetComponent<Image>();
        if (bg != null)
            bg.color = isUser
                ? new Color(0.20f, 0.30f, 0.60f, 0.4f)
                : new Color(0.15f, 0.15f, 0.20f, 0.6f);
    }

    void HandleError(string error)
    {
        SpawnChatMessage($"⚠ {error}", isUser: false);
        ScrollToBottom();
    }

    // ── Tile highlight ────────────────────────────────────────────────────────

    void RefreshTileMap()
    {
        tileMap.Clear();
        var tiles = FindObjectsByType<SystemTile>(FindObjectsSortMode.None);
        foreach (var tile in tiles)
            if (tile.Data != null)
                tileMap[tile.Data.systemId] = tile;
    }

    void HighlightTile(string systemId)
    {
        RefreshTileMap();
        if (!tileMap.TryGetValue(systemId, out SystemTile tile)) return;

        // Flash the tile's renderer
        var renderer = tile.GetComponentInChildren<Renderer>();
        if (renderer != null)
            StartCoroutine(FlashTile(renderer));

        // Close panel so the tile is visible
        if (panelOpen) TogglePanel();
    }

    IEnumerator FlashTile(Renderer r)
    {
        Color original = r.material.color;
        Color flash    = Color.white;
        for (int i = 0; i < 4; i++)
        {
            r.material.color = flash;
            yield return new WaitForSeconds(0.15f);
            r.material.color = original;
            yield return new WaitForSeconds(0.15f);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    void UpdateBadge()
    {
        if (badgeText == null) return;
        badgeText.gameObject.SetActive(unreadCount > 0);
        badgeText.text = unreadCount.ToString();
    }

    void SetIconColor(Color c)
    {
        if (iconImage != null) iconImage.color = c;
    }

    void ScrollToBottom()
    {
        if (scrollRect == null) return;
        StartCoroutine(ScrollNextFrame());
    }

    IEnumerator ScrollNextFrame()
    {
        yield return null; // wait one frame for layout to update
        scrollRect.verticalNormalizedPosition = 0f;
    }
}