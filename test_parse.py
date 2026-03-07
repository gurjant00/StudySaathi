import json
import re

def parse_json_response(response_text):
    text = response_text
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        text = match.group(0)
    cleaned_text = text.replace("```json", "").replace("```", "").strip()
    # Fix invalid JSON escape sequences (e.g. \' which AI generates for apostrophes)
    cleaned_text = re.sub(r'\\(?!["\\/bfnrtu])', '', cleaned_text)
    parsed = json.loads(cleaned_text, strict=False)
    return parsed

# This is the EXACT raw AI output the user pasted
sample = r"""```json
{
    "resume_html": "<div>Bachelor\'s Degree from Tech University</div>",
    "ats_score": 92,
    "suggestions": ["Add metrics"]
}
```"""

try:
    result = parse_json_response(sample)
    print("SUCCESS!")
    print(f"resume_html: {result['resume_html']}")
    print(f"ats_score: {result['ats_score']}")
except Exception as e:
    print(f"FAILED: {e}")
