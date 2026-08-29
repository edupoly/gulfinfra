from pathlib import Path
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

OUT = Path(__file__).resolve().parents[1] / "deliverables" / "GulfInfraHub_Homepage_Document.docx"
NAVY, BLUE, AMBER, INK, MUTED = "0B1F3A", "1D4ED8", "F4B400", "162235", "64748B"
LIGHT, PALE_BLUE, PALE_AMBER, WHITE = "E8EEF5", "EAF2FF", "FFF7D6", "FFFFFF"


def font(run, size=11, bold=False, color=INK):
    run.font.name = "Calibri"
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), "Calibri")
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), "Calibri")
    run.font.size, run.bold = Pt(size), bold
    run.font.color.rgb = RGBColor.from_string(color)


def shade(cell, fill):
    props = cell._tc.get_or_add_tcPr()
    node = props.find(qn("w:shd")) or OxmlElement("w:shd")
    if node.getparent() is None:
        props.append(node)
    node.set(qn("w:fill"), fill)


def table_geometry(table, widths):
    table.autofit = False
    props = table._tbl.tblPr
    for tag, value in (("tblW", sum(widths)), ("tblInd", 120)):
        node = props.find(qn(f"w:{tag}")) or OxmlElement(f"w:{tag}")
        if node.getparent() is None:
            props.append(node)
        node.set(qn("w:w"), str(value)); node.set(qn("w:type"), "dxa")
    grid = table._tbl.tblGrid
    for child in list(grid): grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol"); col.set(qn("w:w"), str(width)); grid.append(col)
    for row in table.rows:
        for i, cell in enumerate(row.cells):
            props = cell._tc.get_or_add_tcPr()
            tcw = props.find(qn("w:tcW")) or OxmlElement("w:tcW")
            if tcw.getparent() is None: props.append(tcw)
            tcw.set(qn("w:w"), str(widths[i])); tcw.set(qn("w:type"), "dxa")
            margins = props.first_child_found_in("w:tcMar") or OxmlElement("w:tcMar")
            if margins.getparent() is None: props.append(margins)
            for side, value in (("top", 80), ("start", 120), ("bottom", 80), ("end", 120)):
                node = margins.find(qn(f"w:{side}")) or OxmlElement(f"w:{side}")
                if node.getparent() is None: margins.append(node)
                node.set(qn("w:w"), str(value)); node.set(qn("w:type"), "dxa")
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def para(doc, text, size=11, bold=False, color=INK, after=6, align=None):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(after); p.paragraph_format.line_spacing = 1.25
    if align is not None: p.alignment = align
    font(p.add_run(text), size, bold, color)


def heading(doc, text, level=1):
    p = doc.add_paragraph(style=f"Heading {level}"); p.paragraph_format.keep_with_next = True; p.add_run(text)
    return p


def bullet(doc, title, detail=""):
    p = doc.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(4); p.paragraph_format.line_spacing = 1.25
    font(p.add_run(title + (" — " if detail else "")), 11, True, NAVY)
    if detail: font(p.add_run(detail))


def callout(doc, label, text, amber=False):
    table = doc.add_table(rows=1, cols=1); table.style = "Table Grid"; table_geometry(table, [9360])
    cell = table.cell(0, 0); shade(cell, PALE_AMBER if amber else PALE_BLUE)
    p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.paragraph_format.line_spacing = 1.2
    font(p.add_run(label + ": "), 10.5, True, NAVY); font(p.add_run(text), 10.5)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def grid(doc, rows, widths=(2600, 6760), header=("Item", "How it is used")):
    table = doc.add_table(rows=0, cols=2); table.style = "Table Grid"
    cells = table.add_row().cells
    for i, text in enumerate(header):
        shade(cells[i], NAVY); font(cells[i].paragraphs[0].add_run(text), 10, True, WHITE)
    for left, right in rows:
        cells = table.add_row().cells; shade(cells[0], LIGHT)
        font(cells[0].paragraphs[0].add_run(left), 10, True, NAVY)
        font(cells[1].paragraphs[0].add_run(right), 10)
        for cell in cells: cell.paragraphs[0].paragraph_format.space_after = Pt(0)
    table_geometry(table, list(widths)); doc.add_paragraph().paragraph_format.space_after = Pt(1)


def page_number(p):
    run = p.add_run(); begin, sep, end = (OxmlElement("w:fldChar") for _ in range(3))
    begin.set(qn("w:fldCharType"), "begin"); sep.set(qn("w:fldCharType"), "separate"); end.set(qn("w:fldCharType"), "end")
    inst = OxmlElement("w:instrText"); inst.set(qn("xml:space"), "preserve"); inst.text = " PAGE "
    value = OxmlElement("w:t"); value.text = "1"
    for node in (begin, inst, sep, value, end): run._r.append(node)
    font(run, 8.5, color=MUTED)


doc = Document(); section = doc.sections[0]
section.page_width, section.page_height = Inches(8.5), Inches(11)
section.top_margin = section.bottom_margin = section.left_margin = section.right_margin = Inches(1)
section.header_distance = section.footer_distance = Inches(0.492)
normal = doc.styles["Normal"]; normal.font.name = "Calibri"; normal.font.size = Pt(11)
normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri"); normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
normal.font.color.rgb = RGBColor.from_string(INK); normal.paragraph_format.space_after = Pt(6); normal.paragraph_format.line_spacing = 1.25
for name, size, color, before, after in (("Heading 1", 16, BLUE, 18, 10), ("Heading 2", 13, BLUE, 14, 7)):
    s = doc.styles[name]; s.font.name = "Calibri"; s.font.size = Pt(size); s.font.bold = True; s.font.color.rgb = RGBColor.from_string(color)
    s._element.rPr.rFonts.set(qn("w:ascii"), "Calibri"); s._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    s.paragraph_format.space_before = Pt(before); s.paragraph_format.space_after = Pt(after); s.paragraph_format.keep_with_next = True
lb = doc.styles["List Bullet"]; lb.font.name = "Calibri"; lb.font.size = Pt(11); lb.paragraph_format.space_after = Pt(4); lb.paragraph_format.line_spacing = 1.25
header = section.header.paragraphs[0]; header.alignment = WD_ALIGN_PARAGRAPH.RIGHT; font(header.add_run("GulfInfraHub  |  Homepage Document"), 8.5, True, MUTED)
footer = section.footer.paragraphs[0]; footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT; font(footer.add_run("Client reference  •  August 2026  |  "), 8.5, color=MUTED); page_number(footer)

para(doc, "CLIENT REFERENCE", 10, True, AMBER, 18, WD_ALIGN_PARAGRAPH.CENTER)
para(doc, "Homepage Document", 28, True, NAVY, 4, WD_ALIGN_PARAGRAPH.CENTER)
para(doc, "Homepage features, marketplace discovery and search usage", 15, color=BLUE, after=20, align=WD_ALIGN_PARAGRAPH.CENTER)
callout(doc, "Purpose", "Provide a complete client reference for the implemented GulfInfraHub homepage, including navigation, search, marketplace previews, trust content and calls to action.")
heading(doc, "Homepage at a glance")
para(doc, "The homepage introduces the GCC construction marketplace, lets visitors search or browse by country, highlights active marketplace content, presents credibility information and directs suppliers, contractors, buyers and developers into the relevant workflows.")
grid(doc, [("Discover", "Search all six marketplace modules or browse GCC country and category destinations"), ("Evaluate", "Review featured contractors, projects, equipment, materials, opportunities, RFQs and suppliers"), ("Build confidence", "Read success stories, testimonials and the Why Choose GulfBuildHub benefits"), ("Take action", "Add a listing, browse tenders, submit quotations, contact sellers/suppliers or request quotations")])
heading(doc, "Document sections", 2)
para(doc, "1. Header and primary navigation  •  2. Hero and homepage actions  •  3. Homepage search  •  4. GCC country browsing  •  5. Marketplace preview sections  •  6. Trust and credibility  •  7. Closing opportunity panel  •  8. Contact Us and footer")

doc.add_page_break()
heading(doc, "1. Header and primary navigation")
para(doc, "The site header remains available at the top of the homepage and provides direct access to the principal marketplace and account destinations.")
grid(doc, [("Brand/Home", "Selecting the GulfInfraHub brand returns the user to the homepage."), ("Marketplace links", "Contractors; Projects & Tenders; RFQs; Equipment Marketplace; Construction & Industrial Materials; Business Opportunities"), ("Information links", "About Us and Contact Us"), ("Login / Register", "Opens authentication for a visitor. A signed-in user sees the appropriate account or administrator destination."), ("Add Listing", "Opens the listing-type selection and creation workflow."), ("Responsive menu", "Navigation adapts for smaller screens through the mobile-menu control.")])
heading(doc, "2. Hero and primary homepage actions")
para(doc, "The hero communicates the platform’s purpose: finding contractors, businesses, equipment, warehouses, labour camps and construction/industrial materials across the Gulf.")
grid(doc, [("Homepage search form", "Keyword, Category, Country, City, Subcategory, Listing Type and Featured Only controls; Search Marketplace opens Unified Global Search."), ("Add Listing", "Directs suppliers, contractors and publishers to /add-listing."), ("Post Requirement", "Directs buyers and project owners to Projects & Tenders."), ("Responsive presentation", "The hero and search controls rearrange across desktop, tablet and mobile layouts.")])
callout(doc, "Search detail", "The full search-input possibilities, keyword catalogue and filter behaviour are documented in Section 3.")

doc.add_page_break()
heading(doc, "2.1 Add Listing feature")
para(doc, "Add Listing allows marketplace participants to create and publish structured records. It is available from the site header, the homepage hero, and the For Suppliers & Contractors action in the closing opportunity panel.")
heading(doc, "Available listing types", 2)
grid(doc, [("Contractors & Services", "Register an engineering, contracting or industrial-service company profile."), ("Projects & Tenders", "Advertise a construction project, tender or bidding opportunity."), ("Request for Quotation", "Request supplier pricing; this choice redirects to the dedicated RFQ creation workflow."), ("Equipment Marketplace", "Advertise equipment for sale, rent or wanted."), ("Industrial Materials", "Publish construction or industrial material supply/buyer records."), ("Business Opportunities", "Publish businesses for sale/wanted, investment or partnership opportunities.")], header=("Listing type", "Purpose"))
heading(doc, "Common four-stage workflow", 2)
bullet(doc, "Select listing type", "Choose one of the six marketplace classifications.")
bullet(doc, "Enter listing details", "Complete the module-specific business, commercial, technical, location and contact information.")
bullet(doc, "Add media and documents", "Provide authorized image/document URLs where the selected module supports them.")
bullet(doc, "Review and publish", "Review the summary, complete fresh email OTP verification, and submit the listing.")
callout(doc, "RFQ exception", "Request for Quotation uses its own RFQ creation workspace at /rfqs?create=1 rather than one of the five standard listing forms.", True)

doc.add_page_break()
heading(doc, "2.2 Information collected by listing type")
grid(doc, [("Contractor", "Company identity/type, establishment year, workforce, specializations, services, licence, country/city, address, areas served, contacts, website, description, project count, response time, logo, gallery and documents."), ("Project / Tender", "Title, project/tender types, status, summary/description, budget/value, deadline, client, tender type, location, countries/cities, sectors, images and documents."), ("Equipment", "Title/type, sale-rent-wanted intent, condition, brand/model/year, hours, price, availability, location, specifications, seller contacts and images."), ("Material", "Material group/type, sale-supplier-buyer intent, supplier, price range, minimum order, availability, lead time, compliance, specifications, contacts and media."), ("Business Opportunity", "Opportunity section/category, title/description, investment or asking price, country/city, contact information and media."), ("RFQ", "Buyer/contact details, project/category, requirement, location, dates, quantity/unit, specifications, delivery address, budget, notes and procurement attachments.")], header=("Type", "Principal information"))
heading(doc, "Draft, review and publication behaviour", 2)
bullet(doc, "Private draft", "Standard listing forms first save entered information as a private draft. A temporary edit token protects the in-progress creation session.")
bullet(doc, "Validation", "Required fields, location relationships, email/phone values, URLs, descriptions and module-specific data are validated before the user can proceed.")
bullet(doc, "Media limits", "Limits vary by module. For example, contractor creation accepts up to six gallery-image URLs and up to five named document URLs.")
bullet(doc, "Email verification", "The publication gate requires a fresh four-digit OTP even when an email address is already known.")
bullet(doc, "Ownership", "After publication, the signed-in verified user becomes the owner and can access the record from My Listings.")
bullet(doc, "Moderation", "Submitted records enter Pending status for administrator approval, rejection or hold. Approved records become Published and publicly searchable.")
callout(doc, "Blocked accounts", "An administrator-blocked account cannot add or publish listings. The Add Listing page displays the stored reason, when present, and provides a Contact Support action.", True)

heading(doc, "2.3 Managing listings after submission")
grid(doc, [("My Listings", "Shows all contractor, project, equipment, material and business-opportunity records owned by the signed-in user."), ("Edit", "Only the owner can edit a standard listing. Saving an edit returns the record to Pending for review."), ("Delete", "Only the owner can delete the listing; associated saved-listing references are also removed."), ("Public view", "Published records can be opened from their marketplace directory and detail page."), ("Featured status", "Administrators may feature a published contractor, project, equipment, material or business-opportunity record. RFQs are not featureable through this control."), ("Status tracking", "Owners can distinguish Draft, Pending, Published, On hold, Rejected and Closed records in their workspace.")], header=("Capability", "Behaviour"))
heading(doc, "Recommended user procedure", 2)
bullet(doc, "Prepare information", "Collect accurate contact, location, commercial, technical and supporting-document details before starting.")
bullet(doc, "Use authorized content", "Upload or reference only media and documents the publisher is permitted to distribute.")
bullet(doc, "Review carefully", "Confirm spelling, category, country/city, price, dates and contact details before OTP verification.")
bullet(doc, "Check My Listings", "After submission, confirm the record appears with the expected status.")
bullet(doc, "Verify after approval", "Open the public listing and confirm the content, images, documents and contact actions.")

doc.add_page_break()
heading(doc, "3. Homepage search")
para(doc, "The homepage form is a quick entry point to Unified Global Search. The application sends the entered values to /search and displays records that satisfy the keyword and every selected filter.")
grid(doc, [("Search scope", "Contractors, Projects & Tenders, RFQs, Equipment, Construction & Industrial Materials, and Business Opportunities"), ("Matching method", "Case-insensitive partial matching across searchable listing information"), ("Filter relationship", "All selected conditions must match; leaving a filter blank keeps that area unrestricted"), ("Result action", "View details opens the relevant listing or RFQ destination")])
callout(doc, "Example", "Entering steel and choosing Construction Materials + UAE + Dubai searches for material records that match all of those selections.", True)
heading(doc, "3.1 Search input box possibilities")
para(doc, "The field labelled “What are you looking for?” accepts free-text keywords. A user can search by a product, service, company type, opportunity, location-related term or marketplace detail.")
heading(doc, "What the keyword can match", 2)
grid(doc, [("Listing title/name", "Company name, equipment title, material name, project title, RFQ title or business-opportunity title"), ("Description", "Words appearing in the listing summary or description"), ("Marketplace category", "Examples: Contractors, RFQs or Equipment Marketplace"), ("Country or city", "Examples: United Arab Emirates, Dubai, Saudi Arabia or Riyadh"), ("Subcategory", "Examples: Civil Contractors, Excavators or Structural Steel"), ("Listing type", "Examples: For Sale, For Rent, Wanted, Open Tender or Investment Opportunities"), ("Additional metadata", "Module-specific information such as rating, project count, status, budget/value, price, condition, availability, RFQ reference or closing date")], header=("Searchable information", "Examples"))
heading(doc, "Recommended way to enter a keyword", 2)
bullet(doc, "Use a clear business term", "Examples: crane, cement, MEP contractor or government tender.")
bullet(doc, "Start broad", "Use one or two meaningful terms, then apply filters if too many results appear.")
bullet(doc, "Use partial terms when useful", "Searching steel can match Structural Steel because matching is based on contained text.")
bullet(doc, "Avoid full questions", "A short phrase such as excavator rental is more suitable than a long sentence.")

doc.add_page_break()
heading(doc, "3.2 Possible search keywords by module")
para(doc, "The following keywords are practical examples that users can enter in the homepage search box. The search is not limited to this list; any word contained in the searchable listing information may be used.")
grid(doc, [("Contractors", "civil contractor; building contractor; infrastructure contractor; road contractor; MEP contractor; electrical contractor; plumbing contractor; HVAC contractor; interior fit-out; steel fabrication; industrial maintenance; EPC contractor; oil and gas contractor; engineering consultant; quantity surveyor; BIM consultant; cost estimation"), ("Projects & Tenders", "building project; infrastructure project; government tender; industrial project; oil and gas project; MEP project; interior fit-out project; roads and bridges; factory project; warehouse construction; maintenance contract; open tender; private tender; public project"), ("RFQs", "RFQ; request for quotation; materials sourcing; equipment rental; equipment purchase; BOQ; drawings; specifications; cement requirement; steel requirement; electrical supplies; plumbing materials; delivery requirement; project name; RFQ reference"), ("Equipment", "excavator; crane; forklift; boom lift; loader; truck; roller; scaffolding; generator; compressor; equipment for sale; equipment for rent; equipment wanted; new equipment; used equipment"), ("Materials", "cement; concrete; steel; rebar; structural steel; bricks; blocks; sand; aggregate; ready-mix concrete; tiles; paints; electrical materials; plumbing materials; HVAC materials; pipes; valves; fittings; flanges; chemicals; welding materials; PPE; pumps; motors; bearings; industrial tools; marine supplies"), ("Business Opportunities", "business for sale; business wanted; investment opportunity; restaurant; cafe; workshop; factory; trading company; car wash; retail shop; franchise; investor; asking price; partnership opportunity")], header=("Marketplace module", "Possible search keywords"))
heading(doc, "3.3 General keywords that can be combined", 2)
grid(doc, [("Location", "Saudi Arabia; UAE; United Arab Emirates; Qatar; Kuwait; Oman; Bahrain; Riyadh; Jeddah; Dubai; Abu Dhabi; Doha; Kuwait City; Muscat; Manama"), ("Commercial intent", "for sale; for rent; wanted; supplier; buyer; investment; open tender; private tender"), ("Condition / availability", "new; used; excellent condition; available; in stock; immediate delivery"), ("Project / procurement", "tender; RFQ; quotation; BOQ; closing date; delivery date; budget; specifications"), ("Company / service", "contractor; supplier; consultant; service provider; manufacturer; rental company"), ("Metadata", "company name; project title; equipment brand/model; material name; RFQ reference; listing status")], header=("Keyword group", "Possible terms"))
heading(doc, "Keyword-only examples", 2)
bullet(doc, "crane", "Returns matching records from any module and any GCC location.")
bullet(doc, "Dubai", "Returns records containing Dubai in their searchable location data.")
bullet(doc, "for rent", "Can match equipment or other listings whose type contains that wording.")
bullet(doc, "published RFQ title/reference", "Can locate a published RFQ through its title or metadata.")
callout(doc, "Important", "The keyword box does not interpret natural-language instructions or synonyms automatically. Results depend on the words stored in each listing. If no result appears, shorten the phrase or try a related term.", True)

doc.add_page_break()
heading(doc, "3.4 Homepage search filters")
para(doc, "Filters narrow the keyword results. Users may apply a filter without entering a keyword, or combine several filters with a keyword. Every selected filter is applied together.")
grid(doc, [("Category", "Restricts results to one core module. Options: Contractors, Projects & Tenders, RFQs, Equipment Marketplace, Construction Materials, or Business Opportunities."), ("Country", "Restricts results to Saudi Arabia, United Arab Emirates, Qatar, Kuwait, Oman or Bahrain."), ("City", "Restricts results to a city. The available city options update after a country is selected."), ("Subcategory", "Restricts results to a detailed classification. The available options update after a category is selected."), ("Listing Type", "Restricts results by the commercial or record type. Options update after a category is selected."), ("Featured Only", "Returns only records marked featured or, for contractor records, featured/premium. RFQs are not treated as featured in Global Search.")], header=("Filter", "Effect"))
heading(doc, "Dependent filter behaviour", 2)
bullet(doc, "Country controls City", "For example, selecting UAE provides Dubai and Abu Dhabi in the homepage City list.")
bullet(doc, "Category controls Subcategory", "For example, Equipment Marketplace provides Excavators, Cranes, Forklifts and other equipment types.")
bullet(doc, "Category controls Listing Type", "For example, Equipment provides For Sale, For Rent and Wanted.")
callout(doc, "Reset behaviour", "Changing the country resets the City selection. Changing the category resets the Subcategory and Listing Type selections.")

doc.add_page_break()
heading(doc, "3.5 Practical filter combinations")
grid(doc, [("Find a rental crane in Dubai", "Keyword: crane; Category: Equipment Marketplace; Country: UAE; City: Dubai; Listing Type: For Rent"), ("Find a civil contractor in Riyadh", "Keyword: civil; Category: Contractors; Country: Saudi Arabia; City: Riyadh; Subcategory: Civil Contractors"), ("Find featured structural-steel materials", "Keyword: steel; Category: Construction Materials; Subcategory: Structural Steel; Featured Only: selected"), ("Browse UAE business opportunities", "Category: Business Opportunities; Country: UAE; leave the keyword blank"), ("Browse published RFQs", "Category: RFQs; optionally select a country/city or enter a requirement keyword"), ("Search every module", "Enter only a keyword and leave all filters at All")], header=("User objective", "Homepage selections"))
heading(doc, "User procedure", 2)
for title, detail in (("Enter a keyword", "Type the product, service, project or opportunity being sought."), ("Select filters", "Choose only the criteria relevant to the requirement."), ("Run the search", "Select Search Marketplace."), ("Review results", "Check the category, title, description, location, type and metadata."), ("Refine if required", "Change or clear filters on the Unified Global Search page.")):
    bullet(doc, title, detail)
heading(doc, "When no results are found", 2)
bullet(doc, "Remove one filter at a time to identify which condition is too restrictive.")
bullet(doc, "Shorten the keyword or try the principal product/service term.")
bullet(doc, "Check that the selected category, country and city describe the same requirement.")
bullet(doc, "Use Clear all filters on the search-results page to restart.")

doc.add_page_break()
heading(doc, "4. GCC country browsing")
para(doc, "The We Serve Across GCC Countries section provides six visual country cards. Selecting a card opens the Contractors directory with that country already applied as a filter.")
grid(doc, [("United Arab Emirates", "Opens contractor results filtered with country code AE"), ("Saudi Arabia", "Opens contractor results filtered with country code SA"), ("Kuwait", "Opens contractor results filtered with country code KW"), ("Qatar", "Opens contractor results filtered with country code QA"), ("Oman", "Opens contractor results filtered with country code OM"), ("Bahrain", "Opens contractor results filtered with country code BH")], header=("Country card", "Result"))
callout(doc, "User benefit", "Country cards provide a fast location-led route into contractor discovery without requiring the visitor to complete the full search form.")

heading(doc, "5. Marketplace preview sections")
para(doc, "The homepage loads marketplace data from the six core modules. Preview sections appear only when matching records are available; each section shows up to three priority or recent records and includes a Browse All action.")
grid(doc, [("Featured Verified Contractors", "Featured contractor profiles. Cards show company/type, country, verification/premium details, description and actions such as Enquire Now and View Profile."), ("Latest Projects & Tenders", "Recent projects/tenders. Cards show sector/type, country, status, budget/value, deadline and actions such as Download Specs and Details."), ("Featured Equipment", "Featured equipment for sale/rent/wanted. Cards show condition, price, location, description and Contact Seller/Details actions."), ("Featured Materials", "Featured construction and industrial materials. Cards show material type, price range, verified manufacturer status, supplier, minimum order and Request Price/View Details actions."), ("Featured Business Opportunities", "Featured businesses, partnerships and investments. Cards show opportunity title, country, required capital/share and an Express Interest action."), ("Featured RFQs", "Up to three RFQs. Cards show reference, status, project, quantity, budget, closing date, urgency, bid count and Submit Quote/View RFQ actions.")], header=("Homepage section", "Displayed information and actions"))

heading(doc, "5.1 How homepage listing cards behave")
bullet(doc, "Dynamic content", "Cards are generated from current marketplace records rather than fixed homepage text.")
bullet(doc, "Priority selection", "Contractor, equipment, material and business sections use featured records; projects use the latest records; the RFQ section uses the first available RFQs returned to the homepage.")
bullet(doc, "Maximum preview", "Each marketplace section displays up to three records on the homepage.")
bullet(doc, "Conditional visibility", "A marketplace preview section is omitted when it has no records to display.")
bullet(doc, "Browse All", "Each section provides a link to its full marketplace directory.")
bullet(doc, "Record action", "Detail and response buttons open the relevant listing, contact or RFQ workflow.")
callout(doc, "Public visibility", "Homepage content is designed for discovery. Record-specific permissions are enforced when a visitor attempts protected actions such as saving, applying, publishing or submitting a quotation.")

heading(doc, "6. Featured suppliers")
para(doc, "Featured Suppliers highlights up to three verified material suppliers. Suppliers are derived from material listings, ranked with featured and verified records first, and supplemented by fallback examples if fewer than three verified suppliers are available.")
grid(doc, [("Supplier identity", "Initials, supplier name, city and country"), ("Verification", "Verified badge when the supplier has a verified material record"), ("Material coverage", "Up to two material-type labels"), ("Listing count", "Number of material listings associated with the supplier"), ("View listings", "Opens Construction Materials with the supplier name applied as the search term")])

heading(doc, "7. Success stories and testimonials")
grid(doc, [("Success Stories", "Three marketplace-use narratives covering regional supplier discovery, location-led equipment matching and cross-border business exposure."), ("Testimonials", "Three five-star testimonial cards presenting procurement, business-development and commercial-user perspectives."), ("Purpose", "Explain intended marketplace value and build confidence for new visitors.")])

doc.add_page_break()
heading(doc, "8. Why Choose GulfBuildHub")
para(doc, "This section presents four platform-benefit messages to explain the value proposition to construction and industrial users.")
grid(doc, [("Pre-Vetted Directory", "Describes checks of licences, ratings and company history before verified status."), ("GCC-Wide Coverage", "Highlights marketplace coverage across Saudi Arabia, UAE, Qatar, Kuwait, Oman and Bahrain."), ("RFQ Matching", "Explains routing supply requirements toward approved local distributors."), ("Premium & Free Tools", "Highlights tender-board access, RFQ posting and machinery marketplace advertising.")], header=("Benefit", "Homepage message"))

heading(doc, "9. GCC Marketplace Opportunities panel")
para(doc, "The closing opportunity panel encourages visitors to convert from browsing into participation.")
grid(doc, [("Direct GCC Connections", "Reach developers and subcontractors across GCC markets."), ("Verified Sourcing", "Promotes transparent direct negotiation without platform commission or middleman fees."), ("Instant Smart Alerts", "Promotes lead and RFQ notifications through email or the business dashboard."), ("For Suppliers & Contractors", "Register Business Listing opens Add Listing for credentials, equipment, materials and tender participation."), ("For Buyers & Developers", "Request Quotations opens Projects & Tenders for publishing requirements and obtaining bids.")], header=("Feature/action", "Purpose"))

contact_heading = heading(doc, "10. Contact Us feature")
contact_heading.paragraph_format.page_break_before = True
para(doc, "Contact Us provides a public support channel for marketplace and business enquiries. Visitors can use it for listing questions, RFQs, tenders, supplier registration, account access or partnership opportunities across GCC markets. Sign-in is not required to submit the form.")
heading(doc, "10.1 Entry points and form fields", 2)
grid(doc, [("Header navigation", "Contact Us opens the public /contact page."), ("Footer", "The company-link area also provides a Contact Us destination."), ("Blocked-account support", "The Add Listing restriction screen links blocked users to Contact Support."), ("Full name", "Required; between 2 and 100 characters."), ("Phone or WhatsApp", "Required; 7 to 25 characters using digits and supported phone symbols."), ("Email address", "Required; valid email format with a maximum length of 160 characters."), ("Message", "Required; between 10 and 3,000 characters.")], header=("Item", "Behaviour or requirement"))
heading(doc, "10.2 Submission workflow", 2)
bullet(doc, "Open Contact Us", "Use the header, footer or an available support link.")
bullet(doc, "Complete all fields", "Provide accurate contact information and a clear description of the enquiry.")
bullet(doc, "Submit message", "The button shows a submitting state while the request is processed.")
bullet(doc, "Correct validation errors", "An error message is displayed when a value does not meet the server-side requirements.")
bullet(doc, "Receive confirmation", "A successful submission displays Message received and confirms that the message was submitted.")

heading(doc, "10.3 Storage and administrator review", 2)
grid(doc, [("Storage", "Validated name, phone/WhatsApp, normalized lowercase email, message and submission timestamp are stored in the database."), ("Admin access", "Authorized administrators review messages from Admin → Contact submissions."), ("Ordering", "Submissions are displayed newest first."), ("Displayed details", "Sender name, email, phone/WhatsApp, message and date/time."), ("Response actions", "The email address opens a new email and the phone number opens a supported telephone application."), ("Submission count", "The page displays the total number of stored contact submissions.")], header=("Administrative feature", "Behaviour"))
callout(doc, "Privacy", "Contact details and message content are business-confidential data. Administrators should use them only to respond to the stated enquiry and should not forward them without a valid business need.", True)

footer_heading = heading(doc, "11. Footer")
footer_heading.paragraph_format.page_break_before = True
para(doc, "The footer repeats important marketplace and company links, reinforces the Gulf construction marketplace identity, provides social/contact destinations and presents a newsletter subscription prompt for tenders and high-priority RFQs.")
callout(doc, "Homepage journey", "A visitor can move from introduction → search or country browsing → marketplace comparison → trust content → listing, tender or quotation action without leaving the homepage navigation structure.")
# The callout helper adds a spacing paragraph; remove it at end-of-document to
# prevent some Word renderers from producing a trailing blank page.
last_paragraph = doc.paragraphs[-1]
last_paragraph._element.getparent().remove(last_paragraph._element)

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT)
