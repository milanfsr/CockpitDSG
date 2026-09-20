using UnityEngine;

/// <summary>
/// Attached to every placed system tile in the scene.
/// Stores placement data, interface type, and handles removal.
/// </summary>
public class SystemTile : MonoBehaviour
{
    public SystemData Data   { get; private set; }
    public PanelGrid  Panel  { get; private set; }
    public int Col, Row, Width, Height;

    // Interface type: "physical_button", "touchscreen", "mixed", "unknown"
    public string InterfaceType { get; set; } = "unknown";

    public void Init(SystemData data, PanelGrid panel, int col, int row, int w, int h)
    {
        Data   = data;
        Panel  = panel;
        Col    = col;
        Row    = row;
        Width  = w;
        Height = h;

        // Default interface type based on system category
        if (data != null)
        {
            InterfaceType = data.category == SystemCategory.Display
                ? "touchscreen"
                : "physical_button";
        }
    }

    public void Remove()
    {
        Panel?.RemoveSystem(Data.systemId);
        Destroy(gameObject);
    }
}