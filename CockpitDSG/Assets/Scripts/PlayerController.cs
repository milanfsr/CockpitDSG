using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    public float moveSpeed = 3f;
    public float gravity   = -9.81f;

    [Header("Look")]
    public float mouseSensitivity = 0.05f;
    public float maxLookAngle     = 80f;

    [Header("References")]
    public Camera playerCamera;

    private CharacterController cc;
    private Vector3 velocity;
    private float xRotation = 0f;
    private bool cursorLocked = true;

    // Set to true by AssistantUI when chat is open
    public bool InputBlocked = false;

    void Start()
    {
        cc = GetComponent<CharacterController>();
        if (playerCamera == null)
            playerCamera = GetComponentInChildren<Camera>();
        LockCursor();
    }

    void Update()
    {
        if (Keyboard.current != null && Keyboard.current.escapeKey.wasPressedThisFrame)
        {
            if (cursorLocked) UnlockCursor();
            else              LockCursor();
        }

        if (cursorLocked && !InputBlocked)
        {
            HandleLook();
            HandleMovement();
        }
    }

    void HandleLook()
    {
        if (Mouse.current == null) return;
        Vector2 delta = Mouse.current.delta.ReadValue();
        xRotation -= delta.y * mouseSensitivity;
        xRotation  = Mathf.Clamp(xRotation, -maxLookAngle, maxLookAngle);
        playerCamera.transform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
        transform.Rotate(Vector3.up * delta.x * mouseSensitivity);
    }

    void HandleMovement()
    {
        if (Keyboard.current == null) return;
        float h = 0f, v = 0f;
        if (Keyboard.current.aKey.isPressed || Keyboard.current.leftArrowKey.isPressed)  h = -1f;
        if (Keyboard.current.dKey.isPressed || Keyboard.current.rightArrowKey.isPressed) h =  1f;
        if (Keyboard.current.sKey.isPressed || Keyboard.current.downArrowKey.isPressed)  v = -1f;
        if (Keyboard.current.wKey.isPressed || Keyboard.current.upArrowKey.isPressed)    v =  1f;
        Vector3 move = transform.right * h + transform.forward * v;
        cc.Move(move * moveSpeed * Time.deltaTime);
        if (cc.isGrounded && velocity.y < 0f) velocity.y = -2f;
        velocity.y += gravity * Time.deltaTime;
        cc.Move(velocity * Time.deltaTime);
    }

    public void LockCursor()
    {
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible   = false;
        cursorLocked     = true;
    }

    public void UnlockCursor()
    {
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible   = true;
        cursorLocked     = false;
    }

    // Public wrappers for PlacementController
    public void LockCursorPublic()   => LockCursor();
    public void UnlockCursorPublic() => UnlockCursor();
}