using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Sends layout JSON to the local Python AI server and receives feedback.
/// Attach to the same GameObject as LayoutSerializer.
/// </summary>
public class AIClient : MonoBehaviour
{
    [Header("Server Settings")]
    public string serverUrl = "http://localhost:5000";
    public float  feedbackDelay = 2f; // seconds after last placement before requesting feedback

    // Events other components can subscribe to
    public event Action<List<FeedbackItem>> OnFeedbackReceived;
    public event Action<string>             OnChatReply;
    public event Action<string>             OnError;

    private LayoutSerializer serializer;
    private Coroutine        pendingFeedback;
    private bool             serverAvailable = false;

    void Start()
    {
        serializer = GetComponent<LayoutSerializer>();
        StartCoroutine(CheckHealth());
    }

    // ── Health check ──────────────────────────────────────────────────────────

    IEnumerator CheckHealth()
    {
        using var req = UnityWebRequest.Get($"{serverUrl}/health");
        yield return req.SendWebRequest();
        if (req.result == UnityWebRequest.Result.Success)
        {
            serverAvailable = true;
            Debug.Log("[AIClient] Python server connected.");
        }
        else
        {
            Debug.LogWarning("[AIClient] Cannot reach Python server. Start server.py first.");
        }
    }

    // ── Request feedback (with delay) ─────────────────────────────────────────

    /// <summary>
    /// Call this whenever a system is placed/moved/removed.
    /// Waits feedbackDelay seconds before actually sending (debounce).
    /// </summary>
    public void RequestFeedbackDelayed(string eventType = "placed")
    {
        if (!serverAvailable) return;
        if (pendingFeedback != null) StopCoroutine(pendingFeedback);
        pendingFeedback = StartCoroutine(DelayedFeedback(eventType));
    }

    /// <summary>
    /// Request immediate feedback (e.g. for full review button).
    /// </summary>
    public void RequestFeedbackNow()
    {
        if (!serverAvailable) return;
        if (pendingFeedback != null) StopCoroutine(pendingFeedback);
        StartCoroutine(SendFeedbackRequest("full_review"));
    }

    IEnumerator DelayedFeedback(string eventType)
    {
        yield return new WaitForSeconds(feedbackDelay);
        yield return SendFeedbackRequest(eventType);
    }

    IEnumerator SendFeedbackRequest(string eventType)
    {
        if (serializer == null) yield break;

        string layoutJson = serializer.SerializeLayout();

        // Wrap in event type
        string body = layoutJson.TrimEnd('}') + $", \"event\": \"{eventType}\"}}";

        using var req = new UnityWebRequest($"{serverUrl}/feedback", "POST");
        req.uploadHandler   = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");

        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success)
        {
            OnError?.Invoke($"Server error: {req.error}");
            yield break;
        }

        try
        {
            var response = JsonUtility.FromJson<FeedbackResponse>(req.downloadHandler.text);
            OnFeedbackReceived?.Invoke(response.feedback ?? new List<FeedbackItem>());
        }
        catch (Exception e)
        {
            OnError?.Invoke($"Could not parse feedback: {e.Message}");
        }
    }

    // ── Chat ──────────────────────────────────────────────────────────────────

    public void SendChatMessage(string message)
    {
        if (!serverAvailable)
        {
            OnError?.Invoke("AI server not available.");
            return;
        }
        StartCoroutine(SendChatRequest(message));
    }

    IEnumerator SendChatRequest(string message)
    {
        string layoutJson = serializer != null ? serializer.SerializeLayout() : "{}";
        // Remove outer braces to embed in new object
        string inner = layoutJson.Trim().TrimStart('{').TrimEnd('}');
        string body  = $"{{\"message\": {JsonUtility.ToJson(message)}, {inner}}}";

        using var req = new UnityWebRequest($"{serverUrl}/chat", "POST");
        req.uploadHandler   = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");

        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success)
        {
            OnError?.Invoke($"Chat error: {req.error}");
            yield break;
        }

        try
        {
            var response = JsonUtility.FromJson<ChatResponse>(req.downloadHandler.text);
            OnChatReply?.Invoke(response.reply);
        }
        catch (Exception e)
        {
            OnError?.Invoke($"Could not parse chat reply: {e.Message}");
        }
    }

    // ── Response data classes ─────────────────────────────────────────────────

    [System.Serializable]
    public class FeedbackResponse
    {
        public List<FeedbackItem> feedback;
        public int    chunks_used;
        public string event_type;
    }

    [System.Serializable]
    public class ChatResponse
    {
        public string reply;
    }
}

[System.Serializable]
public class FeedbackItem
{
    public string system_id;
    public string system_name;
    public string severity;      // HIGH / MEDIUM / LOW
    public string issue;
    public string suggestion;
    public string regulation_ref;
}
