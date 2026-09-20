using UnityEngine;

/// <summary>
/// ScriptableObject representing a single cockpit system.
/// Create one asset per system via Assets > Create > Cockpit > System Data.
/// </summary>
[CreateAssetMenu(fileName = "NewSystem", menuName = "Cockpit/System Data")]
public class SystemData : ScriptableObject
{
    [Header("Identity")]
    [Tooltip("Unique ID matching the survey system IDs (e.g. 'fms', 'autopilot_panel')")]
    public string systemId;

    [Tooltip("Display name shown to the user")]
    public string displayName;

    [Tooltip("Short description shown in the placement UI")]
    [TextArea(2, 4)]
    public string description;

    [Header("Category")]
    public SystemCategory category;

    [Header("Grid Footprint")]
    [Tooltip("Default width in grid cells")]
    public int defaultWidth = 1;

    [Tooltip("Default height in grid cells")]
    public int defaultHeight = 1;

    [Tooltip("Can the player resize this system after placement?")]
    public bool resizable = false;

    [Tooltip("Minimum width if resizable")]
    public int minWidth = 1;

    [Tooltip("Maximum width if resizable")]
    public int maxWidth = 4;

    [Tooltip("Minimum height if resizable")]
    public int minHeight = 1;

    [Tooltip("Maximum height if resizable")]
    public int maxHeight = 4;

    [Header("Display")]
    [Tooltip("Icon shown in the system palette UI")]
    public Sprite icon;

    [Tooltip("Color used to tint this system's tile on the panel")]
    public Color tileColor = new Color(0.2f, 0.5f, 0.9f, 0.85f);
}

public enum SystemCategory
{
    FlightManagement,
    Autoflight,
    FlightControls,
    Warning,
    Communication,
    Engine,
    Fuel,
    Electrical,
    Hydraulic,
    Pressurization,
    IceRain,
    Oxygen,
    Lighting,
    Brakes,
    DisplayManagement,
    Surveillance,
    Emergency,
    Display
}
