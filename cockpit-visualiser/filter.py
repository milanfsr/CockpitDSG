import json

with open('survey_export.json', 'r') as f:
    data = json.load(f)

# Remove indices 0-5 (first 6) and index 7 (8th element, 0-indexed)
filtered = [r for i, r in enumerate(data) if i not in {0,1,2,3,4,5,7}]

with open('survey_filtered.json', 'w') as f:
    json.dump(filtered, f, indent=2, default=str)

print(f"Original: {len(data)} responses")
print(f"Filtered: {len(filtered)} responses")