from pathlib import Path
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

OUT = Path(__file__).resolve().parents[1] / "deliverables" / "GulfInfraHub_Client_User_Guide.docx"
NAVY = "0B1F3A"
BLUE = "1D4ED8"
AMBER = "FBBF24"
LIGHT = "F1F5F9"
MID = "64748B"
GREEN = "047857"
RED = "B91C1C"


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def margins(cell, top=100, start=140, bottom=100, end=140):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_width(cell, width):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_w = tc_pr.find(qn("w:tcW"))
    if tc_w is None:
        tc_w = OxmlElement("w:tcW")
        tc_pr.append(tc_w)
    tc_w.set(qn("w:w"), str(width))
    tc_w.set(qn("w:type"), "dxa")


def set_table_widths(table, widths):
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(sum(widths)))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), "120")
    tbl_ind.set(qn("w:type"), "dxa")
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            set_cell_width(cell, widths[idx])
            margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def font(run, size=10.5, bold=False, color=NAVY, name="Aptos"):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)


def add_text(doc, text, size=10.5, bold=False, color=NAVY, after=6, align=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.2
    if align is not None:
        p.alignment = align
    font(p.add_run(text), size, bold, color)
    return p


def add_bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    font(p.add_run(text), 10.25, False, NAVY)
    return p


def add_step(doc, title, detail):
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    font(p.add_run(title + " — "), 10.25, True, NAVY)
    font(p.add_run(detail), 10.25, False, NAVY)


def heading(doc, text, level=1):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt(14 if level == 1 else 10)
    p.paragraph_format.space_after = Pt(6)
    for r in p.runs:
        font(r, 16 if level == 1 else 12.5, True, BLUE if level == 1 else NAVY)
    return p


def callout(doc, label, text, tone="amber"):
    table = doc.add_table(rows=1, cols=1)
    set_table_widths(table, [9360])
    cell = table.cell(0, 0)
    shade(cell, "FFF7D6" if tone == "amber" else "EAF2FF")
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    font(p.add_run(label + ": "), 10.25, True, NAVY)
    font(p.add_run(text), 10.25, False, NAVY)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def two_col_table(doc, rows, widths=(2450, 6910), header=None):
    table = doc.add_table(rows=0, cols=2)
    table.style = "Table Grid"
    if header:
        cells = table.add_row().cells
        for idx, value in enumerate(header):
            shade(cells[idx], NAVY)
            p = cells[idx].paragraphs[0]
            font(p.add_run(value), 9.5, True, "FFFFFF")
    for left, right in rows:
        cells = table.add_row().cells
        for idx, value in enumerate((left, right)):
            if idx == 0:
                shade(cells[idx], LIGHT)
            p = cells[idx].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            font(p.add_run(value), 9.5, idx == 0, NAVY)
    set_table_widths(table, list(widths))
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def page_break(doc):
    doc.add_page_break()


doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.78)
section.bottom_margin = Inches(0.72)
section.left_margin = Inches(1)
section.right_margin = Inches(1)
section.header_distance = Inches(0.35)
section.footer_distance = Inches(0.35)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Aptos"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
normal.font.size = Pt(10.5)
normal.font.color.rgb = RGBColor.from_string(NAVY)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.2
for name, size, color in (("Heading 1", 16, BLUE), ("Heading 2", 12.5, NAVY), ("Heading 3", 11, NAVY)):
    style = styles[name]
    style.font.name = "Aptos Display"
    style._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    style._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor.from_string(color)

header = section.header.paragraphs[0]
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
font(header.add_run("GulfInfraHub  |  Client User Guide"), 8.5, True, MID)
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
font(footer.add_run("Client reference • August 2026"), 8, False, MID)

# Cover
add_text(doc, "CLIENT USER GUIDE", 10, True, BLUE, 26)
add_text(doc, "GulfInfraHub", 30, True, NAVY, 4)
add_text(doc, "Marketplace operations, administration and account security", 15, False, MID, 28)
callout(doc, "Purpose", "A practical guide for client testers and administrators using the current GulfInfraHub application.", "blue")
heading(doc, "What this guide covers", 1)
two_col_table(doc, [
    ("Access", "OTP sign-in, first-time password setup and password recovery"),
    ("Administration", "Dashboard, categories, users, listings, applications and contact messages"),
    ("Marketplace", "Browse, search, publish listings, create RFQs and submit quotations"),
    ("Security", "Password changes, blocked accounts and safe testing practices"),
], header=("Area", "Included workflows"))
heading(doc, "Administrator accounts", 1)
two_col_table(doc, [
    ("Client testing", "rajesh.puppala@ascentraa.com"),
    ("Development testing", "info.edupoly@gmail.com (testadmin2)"),
], header=("Use", "Account"))
callout(doc, "Important", "Never share OTPs or passwords. OTPs expire after 10 minutes and repeated requests are limited to one per minute.")

page_break(doc)
heading(doc, "1. Sign in and activate an administrator account", 1)
add_text(doc, "Open the application’s Sign in page. New administrator accounts use email verification before a password is created.")
add_step(doc, "Enter the administrator email", "Use the assigned client or development testing address.")
add_step(doc, "Select Email me a code", "A four-digit OTP is sent to the entered address.")
add_step(doc, "Open the correct inbox", "Find the message titled “Your GulfInfraHub verification code”.")
add_step(doc, "Enter the four-digit code", "The code is valid for 10 minutes and can be used once.")
add_step(doc, "Create a password", "Use at least eight characters, including a letter and a number.")
add_step(doc, "Continue to Admin", "A verified admin is redirected to the administrator dashboard.")
callout(doc, "Email routing", "The message may be sent from info.edupoly@gmail.com, but the To field is always the email entered for sign-in. For testadmin2, sender and recipient are the same account.", "blue")
heading(doc, "Returning sign-in", 2)
add_bullet(doc, "Use the saved password by selecting “Already have a password?”.")
add_bullet(doc, "Or request a new email code and sign in without using the password.")
add_bullet(doc, "Use “Forgot password?” to receive a single-use reset link valid for 30 minutes.")
heading(doc, "Common OTP issues", 2)
two_col_table(doc, [
    ("No message", "Check Spam/Junk, confirm the To address, and wait one minute before retrying."),
    ("Code rejected", "Use the newest code; request another if it is older than 10 minutes."),
    ("Too many attempts", "Request a new code after five incorrect entries."),
    ("Wrong inbox", "Return to the email step and enter the intended administrator email."),
], header=("Issue", "Action"))

page_break(doc)
heading(doc, "2. Admin dashboard and navigation", 1)
add_text(doc, "The left admin navigation remains available across administration pages. The top account block shows the signed-in administrator name and email.")
two_col_table(doc, [
    ("Overview", "Marketplace totals, registered users, blocked users and listing status summary"),
    ("Categories", "Status totals by marketplace category"),
    ("User management", "Review users, listing counts, verification state, and block/unblock access"),
    ("All listings", "Review all marketplace records, including unpublished records"),
    ("Project applications", "Filter and inspect applications submitted to projects and tenders"),
    ("Contact submissions", "Read public contact-form messages and contact the sender"),
    ("Change password", "Update the administrator password and sign out other sessions"),
    ("Add listing", "Open the marketplace listing creation workflow"),
], header=("Navigation item", "Purpose"))
heading(doc, "Dashboard overview", 2)
add_bullet(doc, "Marketplace listings counts records across contractors, projects, equipment, materials, opportunities and RFQs.")
add_bullet(doc, "Registered users excludes administrator accounts.")
add_bullet(doc, "Listing status shows Published, Draft, Pending, Closed, Rejected and On hold totals.")
callout(doc, "Testing tip", "After creating or changing a listing, return to Overview and Categories to confirm that status totals update as expected.")

page_break(doc)
heading(doc, "3. Manage listings and categories", 1)
heading(doc, "Review category activity", 2)
add_text(doc, "Categories presents a card for each marketplace area with total and status counts:")
add_bullet(doc, "Contractors")
add_bullet(doc, "Projects & Tenders")
add_bullet(doc, "Equipment Marketplace")
add_bullet(doc, "Construction & Industrial Materials")
add_bullet(doc, "Business Opportunities")
add_bullet(doc, "RFQs")
heading(doc, "Manage all listings", 2)
add_step(doc, "Open All listings", "Records are grouped by marketplace category.")
add_step(doc, "Locate the record", "Use its title, reference, date and current status.")
add_step(doc, "Open the public record", "Use the record link to inspect the customer-facing detail page.")
add_step(doc, "Apply the required moderation action", "Update publication status or featured state where the screen offers those controls.")
add_step(doc, "Verify the result", "Confirm the status badge and public visibility match the intended outcome.")
callout(doc, "Status meaning", "Published is publicly visible; Draft is unfinished; Pending awaits review; On hold is paused; Rejected is declined; Closed is no longer active.", "blue")
heading(doc, "Before publishing", 2)
add_bullet(doc, "Check title, category, location and contact information.")
add_bullet(doc, "Open uploaded documents and verify that images load correctly.")
add_bullet(doc, "Confirm no private, test-only or misleading content is present.")

page_break(doc)
heading(doc, "4. Manage users", 1)
add_text(doc, "User management shows non-admin users only. Each record includes identity details, company, listing count, join date, email-verification state and access status.")
heading(doc, "Block a user", 2)
add_step(doc, "Find the active user", "Confirm the email and company before taking action.")
add_step(doc, "Enter a reason", "A concise reason is recommended for audit clarity.")
add_step(doc, "Select Block user", "The account becomes blocked from marketplace and account activity.")
heading(doc, "Restore a user", 2)
add_step(doc, "Find the blocked account", "The record shows a red Blocked badge and the stored reason.")
add_step(doc, "Select Unblock user", "The account is restored immediately.")
callout(doc, "Caution", "Double-check the email before blocking. Administrator accounts do not appear on this page and cannot be blocked through this interface.")
heading(doc, "Recommended client test", 2)
two_col_table(doc, [
    ("1", "Create a normal test user with a non-admin email."),
    ("2", "Publish or draft one test listing from that account."),
    ("3", "Confirm the user and listing count in User management."),
    ("4", "Block the user and verify restricted activity."),
    ("5", "Unblock the user and verify access is restored."),
], widths=(900, 8460), header=("Step", "Expected action"))

page_break(doc)
heading(doc, "5. Applications and contact submissions", 1)
heading(doc, "Project applications", 2)
add_text(doc, "Administrators can review applications submitted across projects and tenders.")
add_step(doc, "Choose a status filter", "All statuses, submitted, under review, shortlisted, accepted, rejected or withdrawn.")
add_step(doc, "Select Filter", "The list refreshes to matching applications.")
add_step(doc, "Review the summary", "Confirm company, contact, project and listing owner details.")
add_step(doc, "Select Inspect", "Open the complete application record and its activity.")
heading(doc, "Contact submissions", 2)
add_text(doc, "This page lists messages sent through the public Contact form, newest first.")
add_bullet(doc, "The count badge shows the number of submissions.")
add_bullet(doc, "Email links open a new email to the sender.")
add_bullet(doc, "Phone/WhatsApp links can open a supported calling application.")
add_bullet(doc, "The timestamp is displayed using day/month/year formatting.")
callout(doc, "Privacy", "Treat application files and contact details as confidential. Download or forward them only when required for the business process.")

page_break(doc)
heading(doc, "6. Marketplace workflows", 1)
heading(doc, "Browse and search", 2)
add_bullet(doc, "Use the marketplace category pages to browse contractors, projects, equipment, materials and opportunities.")
add_bullet(doc, "Use Search to locate records across the application.")
add_bullet(doc, "Open a record to view its public details and available contact/application actions.")
heading(doc, "Create and publish a listing", 2)
add_step(doc, "Select Add listing", "Choose the appropriate marketplace category.")
add_step(doc, "Complete each form step", "Provide accurate business, location, contact, commercial and technical details.")
add_step(doc, "Upload media/documents", "Use relevant, authorized files only.")
add_step(doc, "Review the summary", "Correct mistakes before publication.")
add_step(doc, "Verify the email", "Publishing requires a fresh OTP to the listing contact or signed-in email.")
add_step(doc, "Publish", "Confirm the result from My listings and the public category page.")
heading(doc, "RFQs and quotations", 2)
add_bullet(doc, "A new RFQ requires contact details, procurement requirements, delivery information and a fresh OTP before publication.")
add_bullet(doc, "Vendors can browse RFQs, submit quotations and use the quotation workspace for follow-up messages.")
add_bullet(doc, "Buyers can manage their RFQs from My RFQs; vendors can manage responses from My quotations.")
callout(doc, "One-time authorization", "The RFQ/listing publication OTP is separate from ordinary sign-in and is consumed by the relevant publishing action.", "blue")

page_break(doc)
heading(doc, "7. Account security and client acceptance checklist", 1)
heading(doc, "Change an administrator password", 2)
add_step(doc, "Open Change password", "Use the Admin navigation.")
add_step(doc, "Enter the current password", "The application validates it before accepting a replacement.")
add_step(doc, "Enter and confirm the new password", "Use at least eight characters with a letter and a number.")
add_step(doc, "Submit the change", "Other active sessions are signed out.")
heading(doc, "Safe testing practices", 2)
add_bullet(doc, "Use the designated test accounts; do not share credentials between client and development testers.")
add_bullet(doc, "Use clearly labeled test listings and remove or close them after acceptance testing.")
add_bullet(doc, "Do not upload real confidential documents during testing.")
add_bullet(doc, "Sign out after using a shared computer.")
heading(doc, "Client acceptance checklist", 2)
two_col_table(doc, [
    ("☐", "Receive an OTP at the intended admin email and complete first-time activation."),
    ("☐", "Open every Admin navigation page without an authorization error."),
    ("☐", "Create, review and publish one clearly marked test listing."),
    ("☐", "Verify dashboard/category counts after the listing action."),
    ("☐", "Create a normal test user; block and then restore it."),
    ("☐", "Submit and inspect a project application."),
    ("☐", "Submit and review a public contact-form message."),
    ("☐", "Change the admin password and confirm other sessions are signed out."),
], widths=(600, 8760), header=("Done", "Acceptance test"))
callout(doc, "Support information", "When reporting an issue, include the page, action, expected result, actual result, time of occurrence and a screenshot—never include passwords or OTPs.")

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT)
