import sys
sys.path.insert(0, '.')

print("=== Step 1: Importing main ===")
try:
    from app.main import app
    print("OK: app imported successfully")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n=== Step 2: Listing all routes ===")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"  {route.path:40} {route.methods}")

print("\n=== Step 3: Testing with TestClient ===")
from fastapi.testclient import TestClient
client = TestClient(app)

resp = client.post("/api/v1/run-query", json={"query": "test", "limit": 3})
print(f"TestClient POST /api/v1/run-query: {resp.status_code}")
print(f"Response: {resp.json()}")

print("\n=== Step 4: Checking OpenAPI ===")
spec = client.get("/openapi.json")
paths = list(spec.json()["paths"].keys())
run_query_in_spec = any("run-query" in p for p in paths)
print(f"run-query in OpenAPI spec: {run_query_in_spec}")
print(f"All paths with 'run': {[p for p in paths if 'run' in p.lower()]}")
