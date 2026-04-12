#!/usr/bin/env python3
"""Helper to send commands to Blender via the BlenderMCP socket."""
import socket, json, sys, base64, os

HOST = "127.0.0.1"
PORT = 9876
TIMEOUT = 600  # long timeout for renders

def send_cmd(cmd_dict):
    s = socket.socket()
    s.settimeout(TIMEOUT)
    s.connect((HOST, PORT))
    s.sendall(json.dumps(cmd_dict).encode("utf-8"))
    data = b""
    while True:
        try:
            chunk = s.recv(65536)
            if not chunk:
                break
            data += chunk
            try:
                json.loads(data.decode("utf-8"))
                break
            except json.JSONDecodeError:
                continue
        except socket.timeout:
            break
    s.close()
    return json.loads(data.decode("utf-8"))

def scene_info():
    return send_cmd({"type": "get_scene_info"})

def object_info(name):
    return send_cmd({"type": "get_object_info", "params": {"name": name}})

def execute(code):
    return send_cmd({"type": "execute_code", "params": {"code": code}})

def screenshot(path=None):
    resp = send_cmd({"type": "get_viewport_screenshot"})
    if resp.get("status") == "success" and "image" in resp.get("result", {}):
        img_data = base64.b64decode(resp["result"]["image"])
        out = path or "/tmp/blender_viewport.png"
        with open(out, "wb") as f:
            f.write(img_data)
        print(f"Screenshot saved: {out} ({len(img_data)} bytes)")
        return out
    elif resp.get("status") == "success" and "image" in resp:
        img_data = base64.b64decode(resp["image"])
        out = path or "/tmp/blender_viewport.png"
        with open(out, "wb") as f:
            f.write(img_data)
        print(f"Screenshot saved: {out} ({len(img_data)} bytes)")
        return out
    else:
        print(f"Screenshot error: {json.dumps(resp)[:500]}")
        return None

def polyhaven_search(query, asset_type="hdris"):
    return send_cmd({"type": "search_polyhaven_assets", "params": {"query": query, "asset_type": asset_type}})

def polyhaven_download(asset_id, asset_type="hdris", resolution="2k"):
    return send_cmd({"type": "download_polyhaven_asset", "params": {"asset_id": asset_id, "asset_type": asset_type, "resolution": resolution}})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps(scene_info(), indent=2))
    elif sys.argv[1] == "exec":
        code = sys.argv[2] if len(sys.argv) > 2 else sys.stdin.read()
        print(json.dumps(execute(code), indent=2))
    elif sys.argv[1] == "screenshot":
        path = sys.argv[2] if len(sys.argv) > 2 else None
        screenshot(path)
    elif sys.argv[1] == "object":
        print(json.dumps(object_info(sys.argv[2]), indent=2))
    elif sys.argv[1] == "polyhaven":
        print(json.dumps(polyhaven_search(sys.argv[2]), indent=2))
