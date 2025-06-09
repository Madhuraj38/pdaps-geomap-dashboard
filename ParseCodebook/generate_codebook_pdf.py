# generate_codebook_pdf.py
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# (variable, friendly_question) pairs ------------------------------
policies = [
    ("Physician only surgical",
     "Requires Surgical Abortion Be Performed by a Physician"),
    ("In person medication",
     "Requires Abortion Medication Be Delivered in Person (e.g., prohibiting mail delivery or requiring medication to be taken in a doctor's office)"),
    ("Waiting period",
     "Enforces a Mandatory Waiting Period Between Pre Abortion Counseling and an Abortion (18 72 hours)"),
    ("Telemedicine ban",
     "Prohibits Telemedicine for Any Abortion Services (e.g., consultations before a surgical abortion)"),
    ("Insurance limits",
     "Limits or Prohibits Insurance Coverage for Abortion (coverage only for rape, incest, life endangerment, or total ban)"),
    ("Statutory protection",
     "Protects Abortion in State Statute (e.g., protecting abortion as a right)"),
    ("APC permitted",
     "Permits Certain Non Physician Advanced Practitioners to Perform Certain Abortion Services (e.g., nurse practitioners, physician assistants)"),
    ("Non cooperation shield",
     "Prohibits Certain Entities from Cooperating with Out of State Investigations for Abortions (e.g., providing information about an in state legal abortion to a restrictive state investigation)"),
    ("Insurance mandate",
     "Requires Private Insurance Coverage for Abortion Services (when the plan covers maternity care)"),
    ("Provider penalty shield",
     "Protects Providers from Certain Penalties (e.g., revoking licensure, criminal investigations, or denial of malpractice coverage)"),
]

styles = getSampleStyleSheet()
story = []

for i, (var, qtext) in enumerate(policies, 1):
    story += [
        Paragraph(f"Question {i}: {qtext}", styles["Normal"]),
        Paragraph("Question Type: Binary - mutually exclusive", styles["Normal"]),
        Paragraph(f"Variable Name: {var}", styles["Normal"]),
        Paragraph("Variable Values: 0,1", styles["Normal"]),
        Paragraph("Value Label: 0 = No", styles["Normal"]),
        Paragraph("Value Label: 1 = Yes", styles["Normal"]),
        Spacer(1, 12),
    ]

SimpleDocTemplate(
    "codebooks/Protections and Restrictions State‑wise.pdf",
    rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36
).build(story)

print("PDF generated ✔")
