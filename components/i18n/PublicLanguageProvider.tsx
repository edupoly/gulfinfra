"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Language = "en" | "ar";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => undefined,
});

const privatePrefixes = [
  "/admin",
  "/my-",
  "/messages",
  "/notifications",
  "/login",
  "/forgot-password",
  "/reset-password",
];

const arabic: Record<string, string> = {
  "Home": "الرئيسية",
  "Contractors": "المقاولون",
  "Projects & Tenders": "المشاريع والمناقصات",
  "RFQs": "طلبات عروض الأسعار",
  "Equipment Marketplace": "سوق المعدات",
  "Construction & Industrial Materials": "مواد البناء والمواد الصناعية",
  "Business Opportunities": "فرص الأعمال",
  "About Us": "من نحن",
  "Contact Us": "اتصل بنا",
  "Login / Register": "تسجيل الدخول / إنشاء حساب",
  "♙ Login / Register": "♙ تسجيل الدخول / إنشاء حساب",
  "Add Listing": "إضافة إعلان",
  "＋ Add Listing": "＋ إضافة إعلان",
  "▣ Add Listing": "▣ إضافة إعلان",
  "Dashboard": "لوحة التحكم",
  "Admin Dashboard": "لوحة الإدارة",
  "Gulf Construction & Business Marketplace": "سوق الخليج للإنشاءات والأعمال",
  "Directories": "الأدلة",
  "Company": "الشركة",
  "Industry Blog": "مدونة القطاع",
  "Careers": "الوظائف",
  "Privacy Policy": "سياسة الخصوصية",
  "Newsletter": "النشرة البريدية",
  "Subscribe to receive weekly tenders and high-priority RFQs directly in your inbox.": "اشترك لتصلك المناقصات الأسبوعية وطلبات عروض الأسعار المهمة مباشرة إلى بريدك.",
  "Your corporate email": "بريد الشركة الإلكتروني",
  "Join": "اشترك",
  "No spam. Unsubscribe anytime.": "من دون رسائل مزعجة. يمكنك إلغاء الاشتراك في أي وقت.",
  "Find Contractors, Businesses, Equipment, Projects & RFQs, Construction & Industrial Materials Across the Gulf": "اكتشف المقاولين والشركات والمعدات والمشاريع وطلبات الأسعار ومواد البناء والصناعة في أنحاء الخليج",
  "What are you looking for?": "ما الذي تبحث عنه؟",
  "Connecting Contractors, Project Owners, Investors, Equipment Owners, Suppliers and Businesses Across GCC Countries.": "نربط المقاولين وأصحاب المشاريع والمستثمرين ومُلّاك المعدات والمورّدين والشركات في دول مجلس التعاون الخليجي.",
  "Category": "الفئة",
  "All Categories": "جميع الفئات",
  "All Countries": "جميع الدول",
  "All Cities": "جميع المدن",
  "Subcategory": "الفئة الفرعية",
  "All Subcategories": "جميع الفئات الفرعية",
  "Listing Type": "نوع الإعلان",
  "All Listing Types": "جميع أنواع الإعلانات",
  "Featured Only": "المميز فقط",
  "Priority listings": "الإعلانات ذات الأولوية",
  "Search Marketplace": "البحث في السوق",
  "⌕ Search Marketplace": "⌕ البحث في السوق",
  "Post Requirement": "نشر متطلب",
  "▤ Post Requirement": "▤ نشر متطلب",
  "WE SERVE ACROSS GCC COUNTRIES": "نخدم جميع دول مجلس التعاون الخليجي",
  "Find Contractors, Businesses, Equipment,": "اكتشف المقاولين والشركات والمعدات،",
  "Projects & RFQs,": "والمشاريع وطلبات عروض الأسعار،",
  "Construction Materials": "مواد البناء",
  "Across the Gulf": "في أنحاء الخليج",
  "Search": "بحث",
  "Browse All Contractors": "عرض جميع المقاولين",
  "Browse All Tenders": "عرض جميع المناقصات",
  "Browse All Equipment": "عرض جميع المعدات",
  "Browse All Materials": "عرض جميع المواد",
  "Browse All Opportunities": "عرض جميع الفرص",
  "Featured Verified Contractors": "مقاولون موثّقون ومميزون",
  "Connect with leading pre-qualified contracting enterprises. Hand-verified by our vetting officers for reliability and performance.": "تواصل مع شركات مقاولات رائدة ومؤهلة مسبقاً، تم التحقق منها يدوياً لضمان الموثوقية وجودة الأداء.",
  "Latest Projects & Tenders": "أحدث المشاريع والمناقصات",
  "Access high-value infrastructure projects, government announcements, and commercial civil contracting tenders.": "اطّلع على مشاريع البنية التحتية الكبرى والإعلانات الحكومية ومناقصات المقاولات المدنية والتجارية.",
  "Featured Equipment": "معدات مميزة",
  "Selected heavy equipment available for sale or rent.": "معدات ثقيلة مختارة متاحة للبيع أو الإيجار.",
  "Featured Materials": "مواد مميزة",
  "Priority construction and industrial material supplies.": "إمدادات مختارة من مواد البناء والمواد الصناعية.",
  "Equipment Marketplace Listings": "إعلانات سوق المعدات",
  "Featured Business Opportunities": "فرص أعمال مميزة",
  "Selected businesses, partnerships, and investment opportunities.": "شركات وشراكات وفرص استثمارية مختارة.",
  "TRUSTED ACROSS THE GCC": "موثوق به في أنحاء الخليج",
  "Featured Suppliers": "مورّدون مميزون",
  "Discover verified suppliers serving construction and infrastructure projects across the Gulf.": "اكتشف مورّدين موثّقين يخدمون مشاريع البناء والبنية التحتية في أنحاء الخليج.",
  "View all suppliers": "عرض جميع المورّدين",
  "View listings": "عرض الإعلانات",
  "MARKETPLACE IMPACT": "أثر السوق",
  "Success Stories": "قصص النجاح",
  "See how GCC construction businesses can use one connected marketplace to discover, source, and grow.": "تعرّف على كيفية استفادة شركات الإنشاءات الخليجية من سوق موحّد للاكتشاف والتوريد والنمو.",
  "What Our Members Say": "آراء أعضائنا",
  "BUILT FOR INDUSTRY PROFESSIONALS": "مصمم لمتخصصي القطاع",
  "Built for industry professionals": "مصمم لمتخصصي القطاع",
  "Trusted across the GCC": "موثوق به في أنحاء الخليج",
  "Marketplace impact": "أثر السوق",
  "INFRASTRUCTURE SOURCING": "توريد البنية التحتية",
  "EQUIPMENT MOBILIZATION": "تجهيز المعدات",
  "BUSINESS GROWTH": "نمو الأعمال",
  "A faster route to qualified regional suppliers": "طريق أسرع للوصول إلى مورّدين إقليميين مؤهلين",
  "The right equipment for a time-sensitive project": "المعدات المناسبة لمشروع عاجل",
  "New visibility beyond a supplier’s home market": "انتشار جديد خارج السوق المحلي للمورّد",
  "One marketplace for regional supplier discovery": "سوق واحد لاكتشاف المورّدين الإقليميين",
  "Location-led equipment matching": "مطابقة المعدات حسب الموقع",
  "Cross-border marketplace exposure": "انتشار في الأسواق العابرة للحدود",
  "A project procurement team used GulfInfraHub to compare specialist material suppliers across multiple GCC markets and build a focused shortlist.": "استخدم فريق مشتريات أحد المشاريع GulfInfraHub لمقارنة مورّدي المواد المتخصصين في عدة أسواق خليجية وإعداد قائمة مختصرة دقيقة.",
  "A civil contractor identified available heavy equipment near its project location and moved from discovery to direct supplier contact without lengthy offline searches.": "تمكّن مقاول مدني من العثور على معدات ثقيلة متاحة قرب موقع مشروعه والتواصل مباشرة مع المورّد من دون بحث تقليدي طويل.",
  "A specialist construction supplier showcased its capabilities to buyers across the Gulf and created new opportunities outside its established local network.": "عرض مورّد إنشاءات متخصص إمكاناته أمام مشترين في أنحاء الخليج وفتح فرصاً جديدة خارج شبكته المحلية المعتادة.",
  "The platform brings contractors, projects, equipment, and suppliers into one clear workflow. It makes the first stage of procurement much easier to manage.": "تجمع المنصة المقاولين والمشاريع والمعدات والمورّدين ضمن مسار عمل واضح، مما يجعل المرحلة الأولى من المشتريات أسهل بكثير.",
  "We can present our services to buyers across the GCC instead of relying only on existing contacts. The category and location filters are especially useful.": "يمكننا عرض خدماتنا للمشترين في دول الخليج بدلاً من الاعتماد على العلاقات القائمة فقط، كما أن فلاتر الفئات والمواقع مفيدة جداً.",
  "Finding relevant project opportunities and checking suitable suppliers in the same marketplace saves our team valuable research time.": "إن العثور على فرص المشاريع المناسبة ومراجعة المورّدين في السوق نفسه يوفر على فريقنا وقتاً ثميناً في البحث.",
  "Procurement Manager": "مدير المشتريات",
  "Regional Infrastructure Group": "مجموعة البنية التحتية الإقليمية",
  "Business Development Director": "مدير تطوير الأعمال",
  "Industrial Supply Company": "شركة التوريدات الصناعية",
  "Commercial Manager": "المدير التجاري",
  "Civil Contracting Company": "شركة مقاولات مدنية",
  "A. Rahman": "أ. رحمن",
  "M. Al-Harbi": "م. الحربي",
  "S. Nair": "س. ناير",
  "Facebook": "فيسبوك",
  "LinkedIn": "لينكدإن",
  "Instagram": "إنستغرام",
  "Meter": "متر",
  "Ton": "طن",
  "Tons": "أطنان",
  "day": "يوم",
  "for 35% equity": "مقابل حصة 35%",
  "listing": "إعلان",
  "listings": "إعلانات",
  "A marketplace designed around the day-to-day needs of buyers, contractors, and suppliers.": "سوق مصمم لتلبية الاحتياجات اليومية للمشترين والمقاولين والمورّدين.",
  "Why Choose GulfBuildHub?": "لماذا تختار GulfBuildHub؟",
  "The premium portal enabling digital transformation in Middle Eastern heavy engineering and industrial sourcing.": "المنصة المتخصصة التي تدعم التحول الرقمي في الهندسة الثقيلة والتوريد الصناعي في الشرق الأوسط.",
  "Pre-Vetted Directory": "دليل خاضع للتحقق المسبق",
  "We check CR licenses, engineering ratings, and company histories before issuing 'Verified Status'.": "نتحقق من السجلات التجارية والتصنيفات الهندسية وتاريخ الشركات قبل منح حالة «موثّق».",
  "GCC-Wide Coverage": "تغطية شاملة لدول الخليج",
  "Single platform tracking commercial developments and projects across Saudi, UAE, Qatar, Kuwait, Oman, and Bahrain.": "منصة واحدة تتابع التطورات والمشاريع التجارية في السعودية والإمارات وقطر والكويت وعُمان والبحرين.",
  "RFQ Matching": "مطابقة طلبات عروض الأسعار",
  "Our matching engine routes your supply requirements directly to approved local distributors.": "يوجّه نظام المطابقة متطلبات التوريد مباشرة إلى الموزعين المحليين المعتمدين.",
  "Premium & Free Tools": "أدوات مجانية ومميزة",
  "Access free tender boards, post unlimited RFQs, and advertise items in the machinery marketplace.": "اطّلع على المناقصات مجاناً، وانشر طلبات أسعار بلا حدود، واعرض المعدات في السوق.",
  "GCC MARKETPLACE OPPORTUNITIES": "فرص السوق الخليجي",
  "GCC Marketplace Opportunities": "فرص السوق الخليجي",
  "Ready to Expand Your Construction Business?": "هل أنت مستعد لتوسيع أعمالك الإنشائية؟",
  "For Suppliers & Contractors": "للمورّدين والمقاولين",
  "For Buyers & Developers": "للمشترين والمطوّرين",
  "List your contracting services, showcase materials inventory, bid on government tenders, or submit equipment rental deals to thousands of prospective builders daily.": "اعرض خدمات المقاولات ومخزون المواد، وشارك في المناقصات الحكومية، أو قدّم عروض تأجير المعدات لآلاف العملاء المحتملين يومياً.",
  "Direct GCC Connections": "اتصالات مباشرة في الخليج",
  "Instantly reach active developers and sub-contractors in Saudi, UAE, Qatar & rest of GCC.": "تواصل فوراً مع المطورين والمقاولين الفرعيين النشطين في السعودية والإمارات وقطر وبقية دول الخليج.",
  "Verified Sourcing": "توريد موثّق",
  "Engage in transparent, direct negotiations with zero platform commission or middleman fees.": "تفاوض مباشرة وبشفافية من دون عمولة للمنصة أو رسوم وسطاء.",
  "Instant Smart Alerts": "تنبيهات ذكية فورية",
  "Receive real-time lead and RFQ notifications direct to your inbox or business dashboard.": "استلم تنبيهات العملاء وطلبات الأسعار فورياً في بريدك أو لوحة أعمالك.",
  "Register your listing, present credentials, list equipment or materials, and bid on public tenders.": "سجّل إعلانك واعرض مؤهلاتك ومعداتك أو موادك وشارك في المناقصات العامة.",
  "Publish project requirements and RFQs to obtain quick, competitive bids from verified GCC companies.": "انشر متطلبات المشاريع وطلبات الأسعار للحصول على عروض سريعة وتنافسية من شركات خليجية موثّقة.",
  "Register Business Listing": "سجّل إعلان شركتك",
  "Request Quotations": "اطلب عروض أسعار",
  "View Profile": "عرض الملف",
  "View Details": "عرض التفاصيل",
  "Details": "التفاصيل",
  "Enquire Now": "استفسر الآن",
  "Download Specs": "تنزيل المواصفات",
  "Contact Seller": "تواصل مع البائع",
  "Request Price": "اطلب السعر",
  "Express Interest": "سجّل اهتمامك",
  "Authority:": "الجهة:",
  "Bid Deadline:": "آخر موعد للتقديم:",
  "Seller:": "البائع:",
  "Supplier:": "المورّد:",
  "Min Order Qty (MOQ):": "الحد الأدنى للطلب:",
  "Save": "حفظ",
  "Saved": "محفوظ",
  "Verified": "موثّق",
  "Unverified": "غير موثّق",
  "Verified Supplier": "مورّد موثّق",
  "✓ Verified Supplier": "✓ مورّد موثّق",
  "VERIFIED SUPPLIER": "مورّد موثّق",
  "VERIFIED MANUFACTURER": "مصنّع موثّق",
  "Verified Manufacturer": "مصنّع موثّق",
  "5 out of 5 stars": "5 من 5 نجوم",
  "Civil Contractors": "مقاولو الأعمال المدنية",
  "Infrastructure Contractors": "مقاولو البنية التحتية",
  "Building Contractors": "مقاولو المباني",
  "MEP Contractors": "مقاولو الأعمال الميكانيكية والكهربائية والصحية",
  "HVAC Contractors": "مقاولو التكييف والتهوية",
  "Electrical Contractors": "مقاولو الأعمال الكهربائية",
  "Plumbing Contractors": "مقاولو السباكة",
  "EPC Contractors": "مقاولو الهندسة والتوريد والإنشاء",
  "Cost Estimation Services": "خدمات تقدير التكاليف",
  "Steel Fabrication 1": "تصنيع الهياكل الفولاذية 1",
  "Civil works": "الأعمال المدنية",
  "Civil Works": "الأعمال المدنية",
  "structural concrete": "الخرسانة الإنشائية",
  "road construction": "إنشاء الطرق",
  "Road Construction": "إنشاء الطرق",
  "project management": "إدارة المشاريع",
  "Project Management": "إدارة المشاريع",
  "Urban Development": "التطوير الحضري",
  "Roads & Bridges": "الطرق والجسور",
  "Landscaping": "تنسيق المواقع",
  "Mechanical Services": "الخدمات الميكانيكية",
  "Utilities": "المرافق",
  "Limited Liability Company (LLC)": "شركة ذات مسؤولية محدودة",
  "Partnership": "شركة تضامن",
  "Construction Company": "شركة إنشاءات",
  "Contracting Group": "مجموعة مقاولات",
  "Heavy Civil & Marine Contractor": "مقاول أعمال مدنية ثقيلة وبحرية",
  "Mokshaja Horizon Contracting LLC": "شركة موكشاجا هورايزن للمقاولات ذ.م.م",
  "grand arabia company": "شركة جراند أرابيا",
  "Qatari Diar Infrastructure Services": "خدمات الديار القطرية للبنية التحتية",
  "Manas Gubbala Gulf Horizon Contracting LLC": "شركة ماناس جوبالا جلف هورايزن للمقاولات ذ.م.م",
  "Edge - Gulf Horizon Contracting LLC": "إيدج - شركة جلف هورايزن للمقاولات ذ.م.م",
  "Raja Arabian Horizon Contracting LLC": "شركة راجا أرابيان هورايزن للمقاولات ذ.م.م",
  "Yamuna Gulf Horizon Contracting LLC": "شركة يامونا جلف هورايزن للمقاولات ذ.م.م",
  "Praveen Gulf Horizon Contracting LLC": "شركة برافين جلف هورايزن للمقاولات ذ.م.م",
  "Nass Corporation": "مؤسسة ناس",
  "Kharafi National": "الخرافي ناشيونال",
  "Galfar Engineering & Contracting": "جلفار للهندسة والمقاولات",
  "Arabian Construction Company (ACC)": "الشركة العربية للإنشاءات",
  "Al-Rashid Trading & Contracting Company (RTCC)": "شركة الراشد للتجارة والمقاولات",
  "Gulf Horizon Contracting LLC delivers civil and infrastructure projects across the UAE. Our experienced engineering teams specialize in structural concrete, roads, utilities, and complete project management for commercial and public-sector clients.": "تنفذ شركة جلف هورايزن للمقاولات مشاريع الأعمال المدنية والبنية التحتية في أنحاء الإمارات. وتتخصص فرقنا الهندسية ذات الخبرة في الخرسانة الإنشائية والطرق والمرافق والإدارة المتكاملة للمشاريع التجارية والحكومية.",
  "Committed to sustainable infrastructure development and large-scale urban growth in Qatar through high-quality engineering delivery.": "ملتزمون بتطوير بنية تحتية مستدامة ودعم النمو الحضري واسع النطاق في قطر من خلال تنفيذ هندسي عالي الجودة.",
  "Marine engineering, piling, precast concrete, works, and heavy machinery procurement specialists across the Gulf.": "متخصصون في الهندسة البحرية وأعمال الخوازيق والخرسانة مسبقة الصب وتوريد الآليات الثقيلة في أنحاء الخليج.",
  "Delivering diversified contracting, MEP, commissioning, and facilities management services for industrial and commercial clients.": "نقدم خدمات متنوعة في المقاولات والأعمال الميكانيكية والكهربائية والصحية والتشغيل وإدارة المرافق للعملاء الصناعيين والتجاريين.",
  "Oman’s leading engineering and contracting company with a strong focus on oil and gas infrastructure, civil structures, and environmental engineering.": "شركة عُمانية رائدة في الهندسة والمقاولات، تركز على البنية التحتية للنفط والغاز والمنشآت المدنية والهندسة البيئية.",
  "A leading contracting group specializing in high-rise towers, airport terminals, smart-city infrastructure, and major oil and gas works.": "مجموعة مقاولات رائدة متخصصة في الأبراج الشاهقة ومحطات المطارات والبنية التحتية للمدن الذكية وأعمال النفط والغاز الكبرى.",
  "Leading construction company providing end-to-end building and engineering solutions across residential, commercial, industrial and infrastructure sectors.": "شركة إنشاءات رائدة تقدم حلول بناء وهندسة متكاملة للقطاعات السكنية والتجارية والصناعية والبنية التحتية.",
  "OPEN TENDER": "مناقصة مفتوحة",
  "Open Tender": "مناقصة مفتوحة",
  "Transport": "النقل",
  "Value:": "القيمة:",
  "Price:": "السعر:",
  "Condition": "الحالة",
  "New Condition": "حالة جديدة",
  "Excellent Condition": "حالة ممتازة",
  "Business Opportunity": "فرصة عمل",
  "Required Capital / Share:": "رأس المال / الحصة المطلوبة:",
  "Ascentraa Riyadh Metro Extension Civil Works Package": "حزمة الأعمال المدنية لتوسعة مترو الرياض - أسنترا",
  "Shehnaz Metro Extension Civil Works Package": "حزمة الأعمال المدنية لتوسعة مترو الرياض - شهناز",
  "Eshwar Riyadh Metro Extension Civil Works Package": "حزمة الأعمال المدنية لتوسعة مترو الرياض - إيشوار",
  "Civil works package for a major metro extension including stations, utility diversions, roads, and associated public infrastructure.": "حزمة أعمال مدنية لتوسعة رئيسية للمترو تشمل المحطات وتحويلات المرافق والطرق والبنية التحتية العامة المرتبطة بها.",
  "Ascentraa Civil works package for a major metro extension including stations, utility diversions, roads, and associated public infrastructure.": "حزمة أسنترا للأعمال المدنية لتوسعة رئيسية للمترو تشمل المحطات وتحويلات المرافق والطرق والبنية التحتية العامة المرتبطة بها.",
  "Ascentraa Riyadh Infrastructure Development Authority": "هيئة أسنترا لتطوير البنية التحتية في الرياض",
  "Riyadh Infrastructure Development Authority": "هيئة تطوير البنية التحتية في الرياض",
  "Ringlock Scaffolding Package — 5,000 m²": "حزمة سقالات رينغلوك — 5,000 م²",
  "Liebherr LTM 1100 Mobile Crane": "رافعة ليبهير المتنقلة LTM 1100",
  "CAT 320 GC Hydraulic Excavator": "حفارة كاتربيلر الهيدروليكية 320 GC",
  "Hot-dip galvanized ringlock scaffolding package supplied with standards, ledgers, decks, braces, base jacks, and access ladders.": "حزمة سقالات رينغلوك مجلفنة بالغمس الساخن تشمل القوائم والعوارض والمنصات والدعامات والقواعد وسلالم الوصول.",
  "100-ton all-terrain mobile crane available with certified operator, lifting accessories, and current third-party inspection.": "رافعة متنقلة لجميع التضاريس بقدرة 100 طن، متاحة مع مشغّل معتمد وملحقات رفع وفحص ساري من جهة خارجية.",
  "GCC-spec hydraulic excavator maintained under a dealer service plan. Clean undercarriage, cold air conditioning, and complete maintenance history.": "حفارة هيدروليكية بمواصفات خليجية، مصانة ضمن خطة خدمة الوكيل، بهيكل سفلي نظيف وتكييف بارد وسجل صيانة كامل.",
  "GulfForm Systems FZE": "جلف فورم سيستمز م.م.ح",
  "Najd Lifting Solutions": "حلول نجد للرفع",
  "Gulf Heavy Machines LLC": "شركة الخليج للآليات الثقيلة ذ.م.م",
  "HDPE Drainage & Water Pipes": "أنابيب الصرف والمياه من البولي إيثيلين عالي الكثافة",
  "Structural Steel H-Beams & I-Beams": "كمرات فولاذية إنشائية على شكل H وI",
  "CEM I Portland Cement — Bulk & Bagged": "أسمنت بورتلاندي CEM I — سائب ومعبأ",
  "Pipes & Valves": "الأنابيب والصمامات",
  "Structural Steel": "الفولاذ الإنشائي",
  "Cement & Concrete": "الأسمنت والخرسانة",
  "Pressure and non-pressure HDPE pipes for municipal water, sewer drainage, and industrial chemical transport.": "أنابيب بولي إيثيلين عالي الكثافة للضغط ومن دون ضغط، لمياه البلديات وتصريف الصرف الصحي ونقل المواد الكيميائية الصناعية.",
  "High-tensile structural steel sections, universal columns, channels, and angle bars with mill certificates and project-site delivery.": "قطاعات فولاذ إنشائي عالية المقاومة وأعمدة وقنوات وزوايا، مع شهادات المصنع والتوصيل إلى موقع المشروع.",
  "Factory-direct cement for major building and infrastructure projects. Bulk tanker and bagged delivery available across Saudi Arabia.": "أسمنت مباشر من المصنع لمشاريع المباني والبنية التحتية الكبرى، مع توصيل سائب أو معبأ في أنحاء السعودية.",
  "Al Wasl Piping Systems": "أنظمة الوصل للأنابيب",
  "Qatar Steel Trading": "قطر لتجارة الحديد",
  "Yamama Cement Company": "شركة أسمنت اليمامة",
  "Manas Profitable Construction Equipment Rental Business for Sale": "ماناس: مشروع مربح لتأجير معدات البناء للبيع",
  "Profitable Italian Restaurant for Sale — Dubai Marina": "مطعم إيطالي مربح للبيع — مرسى دبي",
  "Equity Partnership in Metal Fabrication Workshop": "شراكة بحصة ملكية في ورشة تصنيع المعادن",
  "Established construction equipment rental company serving contractors across Dubai and the Northern Emirates. The sale includes a maintained fleet of excavators, loaders, generators, active rental contracts, trained operators, workshop tools, customer records, and an experienced operations team. Detailed financial information is available to qualified buyers after signing a confidentiality agreement.": "شركة قائمة لتأجير معدات البناء تخدم المقاولين في دبي والإمارات الشمالية. يشمل البيع أسطولاً مصاناً من الحفارات واللوادر والمولدات وعقود إيجار نشطة ومشغّلين مدربين وأدوات ورشة وسجلات عملاء وفريق تشغيل خبير. تتوفر المعلومات المالية التفصيلية للمشترين المؤهلين بعد توقيع اتفاقية سرية.",
  "Fully operating waterfront restaurant with 80 seats, professional kitchen, active licences, delivery partnerships, trained staff, and established monthly revenue.": "مطعم عامل بالكامل على الواجهة البحرية بسعة 80 مقعداً ومطبخ احترافي وتراخيص سارية وشراكات توصيل وموظفين مدربين وإيرادات شهرية مستقرة.",
  "Operating fabrication and welding workshop seeking growth capital for CNC machinery and laser cutting systems against a strong infrastructure-order backlog.": "ورشة تصنيع ولحام عاملة تبحث عن رأس مال للنمو وشراء آلات تحكم رقمي وأنظمة قطع بالليزر، مع رصيد قوي من طلبات مشاريع البنية التحتية.",
  "FOR SALE": "للبيع",
  "FOR RENT": "للإيجار",
  "Browse Contractors": "تصفح المقاولين",
  "Search contractors or services": "ابحث عن مقاولين أو خدمات",
  "Contractor Type": "نوع المقاول",
  "Country": "الدولة",
  "City": "المدينة",
  "Established since": "تأسست منذ",
  "Any year": "أي سنة",
  "Reset filters": "إعادة ضبط الفلاتر",
  "No contractors match your selected filters. Try adjusting the search criteria.": "لا توجد نتائج تطابق الفلاتر المحددة. جرّب تعديل معايير البحث.",
  "Back to Contractors": "العودة إلى المقاولين",
  "VERIFIED CONTRACTOR": "مقاول موثّق",
  "Company type": "نوع الشركة",
  "Established": "سنة التأسيس",
  "Projects completed": "المشاريع المنجزة",
  "Verification status": "حالة التوثيق",
  "Verified contractor": "مقاول موثّق",
  "About": "نبذة",
  "Our Services": "خدماتنا",
  "Company Details": "بيانات الشركة",
  "Business Type": "نوع النشاط",
  "Est. Year": "سنة التأسيس",
  "Main Office": "المكتب الرئيسي",
  "Phone": "الهاتف",
  "Website": "الموقع الإلكتروني",
  "Email": "البريد الإلكتروني",
  "Areas We Serve": "المناطق التي نخدمها",
  "Featured Projects": "مشاريع مميزة",
  "Contact Contractor": "تواصل مع المقاول",
  "Verified & Trusted": "موثّق وموثوق",
  "Contact this contractor": "تواصل مع هذا المقاول",
  "WhatsApp": "واتساب",
  "Send Enquiry": "إرسال استفسار",
  "Browse Projects & Tenders": "تصفح المشاريع والمناقصات",
  "Browse Equipment": "تصفح المعدات",
  "Browse Materials": "تصفح المواد",
  "Browse Business Opportunities": "تصفح فرص الأعمال",
  "Filter": "تصفية",
  "Filters": "الفلاتر",
  "Sort by": "الترتيب حسب",
  "Newest first": "الأحدث أولاً",
  "Price, low to high": "السعر: من الأقل إلى الأعلى",
  "Price, high to low": "السعر: من الأعلى إلى الأقل",
  "For Sale": "للبيع",
  "For Rent": "للإيجار",
  "Wanted": "مطلوب",
  "New": "جديد",
  "Used": "مستعمل",
  "Excellent": "ممتاز",
  "Good": "جيد",
  "Availability": "التوفر",
  "Location": "الموقع",
  "Description": "الوصف",
  "Specifications": "المواصفات",
  "Contact": "التواصل",
  "Call": "اتصال",
  "Submit Quote": "تقديم عرض سعر",
  "View RFQ": "عرض طلب السعر",
  "Open": "مفتوح",
  "Closed": "مغلق",
  "About GulfBuildHub": "عن GulfBuildHub",
  "Contact GulfBuildHub": "تواصل مع GulfBuildHub",
  "Name": "الاسم",
  "Subject": "الموضوع",
  "Message": "الرسالة",
  "Send Message": "إرسال الرسالة",
  "Loading…": "جارٍ التحميل…",
  "No results found": "لم يتم العثور على نتائج",
  "GulfBuildHub is the leading premium business-to-business listing directory and industrial marketplace in the GCC. Connecting buyers, suppliers, contractors, and project developers across the Middle East.": "GulfBuildHub هو دليل أعمال وسوق صناعي متخصص في دول الخليج، يربط المشترين والمورّدين والمقاولين ومطوّري المشاريع في الشرق الأوسط.",
  "All Rights Reserved.": "جميع الحقوق محفوظة.",
  "Serving Saudi Arabia, UAE, Qatar, Kuwait, Oman & Bahrain.": "نخدم السعودية والإمارات وقطر والكويت وعُمان والبحرين.",
  "No spam. Unsubscribe anytime. ©  2026 GulfBuildHub. All Rights Reserved. Serving Saudi Arabia, UAE, Qatar, Kuwait, Oman & Bahrain.": "من دون رسائل مزعجة. يمكنك إلغاء الاشتراك في أي وقت. © 2026 GulfBuildHub. جميع الحقوق محفوظة. نخدم السعودية والإمارات وقطر والكويت وعُمان والبحرين.",
  "GulfBuildHub. All Rights Reserved. Serving Saudi Arabia, UAE, Qatar, Kuwait, Oman & Bahrain.": "GulfBuildHub. جميع الحقوق محفوظة. نخدم السعودية والإمارات وقطر والكويت وعُمان والبحرين.",
  "Bahrain": "البحرين",
  "Kuwait": "الكويت",
  "Oman": "عُمان",
  "Qatar": "قطر",
  "Saudi Arabia": "السعودية",
  "United Arab Emirates": "الإمارات العربية المتحدة",
  "UAE": "الإمارات",
  "AE": "الإمارات",
  "QA": "قطر",
  "Dubai": "دبي",
  "Abu Dhabi": "أبوظبي",
  "Sharjah": "الشارقة",
  "Doha": "الدوحة",
  "Lusail": "لوسيل",
  "Al Rayyan": "الريان",
  "Riyadh": "الرياض",
  "Jeddah": "جدة",
  "Dammam": "الدمام",
  "Manama": "المنامة",
  "Muscat": "مسقط",
  "Salalah": "صلالة",
  "Duqm": "الدقم",
  "Kuwait City": "مدينة الكويت",
  "Ahmadi": "الأحمدي",
  "Jahra": "الجهراء",
  "Ajman": "عجمان",
  "Al Ain": "العين",
  "Fujairah": "الفجيرة",
  "Jebel Ali": "جبل علي",
  "Kalba": "كلباء",
  "Khor Fakkan": "خورفكان",
  "Madinat Zayed": "مدينة زايد",
  "Mussafah": "مصفح",
  "Ras Al Khaimah": "رأس الخيمة",
  "Ruwais": "الرويس",
  "Umm Al Quwain": "أم القيوين",
  "Budaiya": "البديع",
  "Durrat Al Bahrain": "درة البحرين",
  "Hamad Town": "مدينة حمد",
  "Hidd": "الحد",
  "Isa Town": "مدينة عيسى",
  "Jidhafs": "جدحفص",
  "Muharraq": "المحرق",
  "Riffa": "الرفاع",
  "Saar": "سار",
  "Sitra": "سترة",
  "Zallaq": "الزلاق",
  "Fahaheel": "الفحيحيل",
  "Farwaniya": "الفروانية",
  "Hawalli": "حولي",
  "Mahboula": "المهبولة",
  "Mangaf": "المنقف",
  "Mubarak Al-Kabeer": "مبارك الكبير",
  "Sabah Al-Salem": "صباح السالم",
  "Salmiya": "السالمية",
  "Shuaiba": "الشعيبة",
  "Shuwaikh": "الشويخ",
  "Adam": "أدم",
  "Al Buraimi": "البريمي",
  "Bahla": "بهلاء",
  "Barka": "بركاء",
  "Ibri": "عبري",
  "Khasab": "خصب",
  "Liwa": "لوى",
  "Nizwa": "نزوى",
  "Quriyat": "قريات",
  "Raysut": "ريسوت",
  "Rustaq": "الرستاق",
  "Saham": "صحم",
  "Samail": "سمائل",
  "Seeb": "السيب",
  "Shinas": "شناص",
  "Sohar": "صحار",
  "Sur": "صور",
  "Dukhan": "دخان",
  "Mesaieed": "مسيعيد",
  "Ras Laffan": "راس لفان",
  "Umm Salal": "أم صلال",
  "Abha": "أبها",
  "Al Ahsa": "الأحساء",
  "Al Baha": "الباحة",
  "Al Kharj": "الخرج",
  "Al Khobar": "الخبر",
  "AlUla": "العلا",
  "Arar": "عرعر",
  "Buraidah": "بريدة",
  "Fadhili": "الفاضلي",
  "Hail": "حائل",
  "Jafurah": "الجافورة",
  "Jizan": "جازان",
  "Jubail": "الجبيل",
  "Khafji": "الخفجي",
  "Khamis Mushait": "خميس مشيط",
  "Madinah": "المدينة المنورة",
  "Makkah": "مكة المكرمة",
  "NEOM / Tabuk Region": "نيوم / منطقة تبوك",
  "Najran": "نجران",
  "Rabigh": "رابغ",
  "Ras Al Khair": "رأس الخير",
  "Ras Tanura": "رأس تنورة",
  "Sakaka": "سكاكا",
  "Shuaibah": "الشعيبة",
  "Tabuk": "تبوك",
  "Taif": "الطائف",
  "Turaif": "طريف",
  "Umluj": "أملج",
  "Yanbu": "ينبع",
};

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatedAttributes = ["placeholder", "aria-label", "title"];

function translatePhrase(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const direct = arabic[value] ?? arabic[normalized];
  if (direct) return direct;

  const showingContractors = normalized.match(/^Showing (\d+) contractors$/);
  if (showingContractors) return `عرض ${showingContractors[1]} من المقاولين`;
  const projectsCompleted = normalized.match(/^(\d+) projects completed$/);
  if (projectsCompleted) return `${projectsCompleted[1]} مشروعاً منجزاً`;
  const established = normalized.match(/^Established in (\d{4})$/);
  if (established) return `تأسست عام ${established[1]}`;
  const rating = normalized.match(/^Rating: (.+)$/);
  if (rating) return `التقييم: ${rating[1]}`;
  const responseTime = normalized.match(/^Response time: (.+)$/);
  if (responseTime) return `وقت الاستجابة: ${responseTime[1]}`;
  const listings = normalized.match(/^(\d+) listings?$/);
  if (listings) return `${listings[1]} إعلان`;
  const browseCountry = normalized.match(/^Browse listings in (.+)$/);
  if (browseCountry) return `تصفح الإعلانات في ${arabic[browseCountry[1]] ?? browseCountry[1]}`;
  const reviews = normalized.match(/^(\d+) reviews?$/);
  if (reviews) return `${reviews[1]} مراجعة`;
  const parenthesizedReviews = normalized.match(/^\((\d+) reviews?\)$/);
  if (parenthesizedReviews) return `(${parenthesizedReviews[1]} مراجعة)`;
  if (normalized === "reviews)" || normalized === "review)") return "مراجعة)";
  const numberedLabel = normalized.match(/^(Infrastructure sourcing|Equipment mobilization|Business growth) (\d+)$/i);
  if (numberedLabel) return `${arabic[numberedLabel[1].toUpperCase()]} ${numberedLabel[2]}`;
  const copyright = normalized.match(/^© (\d{4}) GulfBuildHub\. All Rights Reserved\. Serving Saudi Arabia, UAE, Qatar, Kuwait, Oman & Bahrain\.$/);
  if (copyright) return `© ${copyright[1]} GulfBuildHub. جميع الحقوق محفوظة. نخدم السعودية والإمارات وقطر والكويت وعُمان والبحرين.`;
  return value;
}

function replaceKeepingWhitespace(value: string, translated: string) {
  const start = value.match(/^\s*/)?.[0] ?? "";
  const end = value.match(/\s*$/)?.[0] ?? "";
  return `${start}${translated}${end}`;
}

function translateDocument(language: Language) {
  const root = document.body;
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    if (parent && !["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName)) {
      const original = originalText.get(node) ?? node.nodeValue ?? "";
      if (!originalText.has(node)) originalText.set(node, original);
      const trimmed = original.trim();
      node.nodeValue = language === "ar"
        ? replaceKeepingWhitespace(original, translatePhrase(trimmed))
        : original;
    }
    node = walker.nextNode() as Text | null;
  }

  root.querySelectorAll("*").forEach((element) => {
    let saved = originalAttributes.get(element);
    if (!saved) {
      saved = new Map<string, string>();
      originalAttributes.set(element, saved);
    }
    translatedAttributes.forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (current === null) return;
      if (!saved!.has(attribute)) saved!.set(attribute, current);
      const original = saved!.get(attribute)!;
      element.setAttribute(attribute, language === "ar" ? translatePhrase(original) : original);
    });
  });
}

export function PublicLanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicPage = !privatePrefixes.some((prefix) => pathname.startsWith(prefix));
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("gulfbuildhub-language");
    if (saved !== "ar") return;
    const frame = window.requestAnimationFrame(() => setLanguageState("ar"));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const activeLanguage = publicPage ? language : "en";
    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = activeLanguage === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("font-arabic", activeLanguage === "ar");
    translateDocument(activeLanguage);

    if (!publicPage) return;
    const options: MutationObserverInit = { childList: true, characterData: true, subtree: true };
    const observer = new MutationObserver(() => {
      observer.disconnect();
      translateDocument(language);
      observer.observe(document.body, options);
    });
    observer.observe(document.body, options);
    return () => observer.disconnect();
  }, [language, pathname, publicPage]);

  const value = useMemo<LanguageContextValue>(() => ({
    language: publicPage ? language : "en",
    setLanguage: (nextLanguage) => {
      window.localStorage.setItem("gulfbuildhub-language", nextLanguage);
      setLanguageState(nextLanguage);
    },
  }), [language, publicPage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function usePublicLanguage() {
  return useContext(LanguageContext);
}

