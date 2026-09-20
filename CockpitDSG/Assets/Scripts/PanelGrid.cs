using System.Collections.Generic;
using UnityEngine;

public class PanelGrid : MonoBehaviour
{
    [Header("Grid Dimensions")]
    public int cols = 7;
    public int rows = 2;

    [Header("Panel Identity")]
    public string panelId = "glareshield";

    private Dictionary<Vector2Int, string> occupiedCells = new Dictionary<Vector2Int, string>();

    public class PlacedSystem
    {
        public string systemId;
        public int col, row, width, height;
    }
    private List<PlacedSystem> placedSystems = new List<PlacedSystem>();

    // ── Grid geometry ─────────────────────────────────────────────────────────

    private void GetPanelCorners(out Vector3 origin, out Vector3 right, out Vector3 up)
    {
        MeshFilter mf = GetComponent<MeshFilter>();
        if (mf != null && mf.sharedMesh != null)
        {
            Bounds b = mf.sharedMesh.bounds;
            Vector3 localOrigin = new Vector3(b.min.x, b.center.y, b.min.z);
            Vector3 localRight  = new Vector3(b.max.x, b.center.y, b.min.z);
            Vector3 localUp     = new Vector3(b.min.x, b.center.y, b.max.z);
            origin = transform.TransformPoint(localOrigin);
            right  = transform.TransformPoint(localRight) - origin;
            up     = transform.TransformPoint(localUp)    - origin;
        }
        else
        {
            origin = transform.position - transform.right * 0.5f - transform.forward * 0.5f;
            right  = transform.right;
            up     = transform.forward;
        }
    }

    public Vector3 GetCellWorldPosition(int col, int row)
    {
        GetPanelCorners(out Vector3 origin, out Vector3 right, out Vector3 up);
        float u = (col + 0.5f) / cols;
        float v = (row + 0.5f) / rows;
        return origin + right * u + up * v;
    }

    /// <summary>
    /// Returns the world-space centre of a multi-cell footprint.
    /// </summary>
    public Vector3 GetFootprintCentre(int col, int row, int width, int height)
    {
        GetPanelCorners(out Vector3 origin, out Vector3 right, out Vector3 up);
        float u = (col + width  * 0.5f) / cols;
        float v = (row + height * 0.5f) / rows;
        return origin + right * u + up * v;
    }

    public Vector2Int WorldPositionToCell(Vector3 worldPos)
    {
        GetPanelCorners(out Vector3 origin, out Vector3 right, out Vector3 up);
        Vector3 delta = worldPos - origin;
        float u = Vector3.Dot(delta, right.normalized) / right.magnitude;
        float v = Vector3.Dot(delta, up.normalized)    / up.magnitude;
        int col = Mathf.FloorToInt(u * cols);
        int row = Mathf.FloorToInt(v * rows);
        if (col < 0 || col >= cols || row < 0 || row >= rows)
            return new Vector2Int(-1, -1);
        return new Vector2Int(col, row);
    }

    // ── Placement ─────────────────────────────────────────────────────────────

    public bool CanPlace(int col, int row, int width, int height)
    {
        if (col < 0 || row < 0 || col + width > cols || row + height > rows)
            return false;
        for (int c = col; c < col + width; c++)
            for (int r = row; r < row + height; r++)
                if (occupiedCells.ContainsKey(new Vector2Int(c, r)))
                    return false;
        return true;
    }

    public bool PlaceSystem(string systemId, int col, int row, int width, int height)
    {
        if (!CanPlace(col, row, width, height)) return false;
        for (int c = col; c < col + width; c++)
            for (int r = row; r < row + height; r++)
                occupiedCells[new Vector2Int(c, r)] = systemId;
        placedSystems.Add(new PlacedSystem { systemId = systemId, col = col, row = row, width = width, height = height });
        return true;
    }

    public bool RemoveSystem(string systemId)
    {
        var s = placedSystems.Find(x => x.systemId == systemId);
        if (s == null) return false;
        for (int c = s.col; c < s.col + s.width; c++)
            for (int r = s.row; r < s.row + s.height; r++)
                occupiedCells.Remove(new Vector2Int(c, r));
        placedSystems.Remove(s);
        return true;
    }

    public string GetSystemAt(int col, int row)
    {
        occupiedCells.TryGetValue(new Vector2Int(col, row), out string id);
        return id;
    }

    public List<PlacedSystem> GetAllPlacedSystems() => placedSystems;

    public void ClearAll()
    {
        occupiedCells.Clear();
        placedSystems.Clear();
    }

    public Vector2 GetCellWorldSize()
    {
        Vector3 origin = GetCellWorldPosition(0, 0);
        Vector3 colStep = GetCellWorldPosition(1, 0);
        Vector3 rowStep = GetCellWorldPosition(0, 1);
        return new Vector2(Vector3.Distance(origin, colStep), Vector3.Distance(origin, rowStep));
    }

    // ── Gizmos ────────────────────────────────────────────────────────────────

    private void OnDrawGizmosSelected()
    {
        GetPanelCorners(out Vector3 origin, out Vector3 right, out Vector3 up);
        Gizmos.color = new Color(0f, 0.8f, 1f, 0.9f);

        for (int c = 0; c <= cols; c++)
        {
            float u = (float)c / cols;
            Gizmos.DrawLine(origin + right * u, origin + right * u + up);
        }
        for (int r = 0; r <= rows; r++)
        {
            float v = (float)r / rows;
            Gizmos.DrawLine(origin + up * v, origin + right + up * v);
        }

        Gizmos.color = new Color(1f, 0.2f, 0.2f, 0.5f);
        foreach (var kvp in occupiedCells)
        {
            int c = kvp.Key.x, r = kvp.Key.y;
            float u0 = (float)c / cols,       u1 = (float)(c + 1) / cols;
            float v0 = (float)r / rows,       v1 = (float)(r + 1) / rows;
            Vector3 bl = origin + right * u0 + up * v0;
            Vector3 br = origin + right * u1 + up * v0;
            Vector3 tr = origin + right * u1 + up * v1;
            Vector3 tl = origin + right * u0 + up * v1;
            Gizmos.DrawLine(bl, br); Gizmos.DrawLine(br, tr);
            Gizmos.DrawLine(tr, tl); Gizmos.DrawLine(tl, bl);
        }
    }
}
