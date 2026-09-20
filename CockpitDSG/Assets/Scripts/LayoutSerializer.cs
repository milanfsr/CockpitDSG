using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Finds all PanelGrid objects in the scene and serializes
/// the current cockpit layout to a JSON-compatible structure.
/// Attach to any persistent GameObject (e.g. a GameManager).
/// </summary>
public class LayoutSerializer : MonoBehaviour
{
    // Call this to get the current layout as a JSON string
    public string SerializeLayout()
    {
        var panels = FindObjectsByType<PanelGrid>(FindObjectsSortMode.None);
        var panelList = new List<PanelData>();

        foreach (var panel in panels)
        {
            var systems = panel.GetAllPlacedSystems();
            if (systems.Count == 0) continue; // skip empty panels

            var sysList = new List<SystemPlacementData>();
            foreach (var sys in systems)
            {
                // Find the SystemTile to get interface type
                string interfaceType = "unknown";
                var tile = FindTileForSystem(sys.systemId, panel);
                if (tile != null) interfaceType = tile.InterfaceType;

                sysList.Add(new SystemPlacementData
                {
                    system_id      = sys.systemId,
                    system_name    = GetSystemName(sys.systemId),
                    col            = sys.col,
                    row            = sys.row,
                    width          = sys.width,
                    height         = sys.height,
                    interface_type = interfaceType,
                });
            }

            panelList.Add(new PanelData
            {
                panel_id = panel.panelId,
                systems  = sysList,
            });
        }

        int totalSystems = 0;
        foreach (var p in panelList) totalSystems += p.systems.Count;

        var layout = new LayoutData
        {
            panels                = panelList,
            total_systems_placed  = totalSystems,
        };

        return JsonUtility.ToJson(new LayoutWrapper { layout = layout }, true);;
    }

    SystemTile FindTileForSystem(string systemId, PanelGrid panel)
    {
        var tiles = FindObjectsByType<SystemTile>(FindObjectsSortMode.None);
        foreach (var tile in tiles)
        {
            if (tile.Data != null && tile.Data.systemId == systemId && tile.Panel == panel)
                return tile;
        }
        return null;
    }

    string GetSystemName(string systemId)
    {
        var data = Resources.Load<SystemData>($"Systems/{systemId}");
        return data != null ? data.displayName : systemId;
    }

    // ── Serializable data classes ─────────────────────────────────────────────
    // JsonUtility requires [System.Serializable]

    [System.Serializable]
    public class LayoutWrapper
    {
        public LayoutData layout;
        public string event_type = "full_review";
    }

    [System.Serializable]
    public class LayoutData
    {
        public List<PanelData> panels;
        public int total_systems_placed;
    }

    [System.Serializable]
    public class PanelData
    {
        public string panel_id;
        public List<SystemPlacementData> systems;
    }

    [System.Serializable]
    public class SystemPlacementData
    {
        public string system_id;
        public string system_name;
        public int    col;
        public int    row;
        public int    width;
        public int    height;
        public string interface_type;
    }
}
