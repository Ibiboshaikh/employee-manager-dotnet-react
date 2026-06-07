# Builds a professional .docx (Open XML) without Word. ASCII-only source.
$ErrorActionPreference = 'Stop'

function Esc([string]$s){ $s -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;' }

# A single text run with optional formatting
function Run([string]$text,[bool]$bold=$false,[string]$color=$null,[int]$szHalf=22,[string]$font='Segoe UI'){
  $rpr = "<w:rPr><w:rFonts w:ascii='$font' w:hAnsi='$font'/>"
  if($bold){ $rpr += "<w:b/>" }
  if($color){ $rpr += "<w:color w:val='$color'/>" }
  $rpr += "<w:sz w:val='$szHalf'/><w:szCs w:val='$szHalf'/></w:rPr>"
  return "<w:r>$rpr<w:t xml:space='preserve'>$(Esc $text)</w:t></w:r>"
}

# A plain paragraph (one run)
function P([string]$text,[int]$szHalf=22,[string]$color=$null,[bool]$bold=$false,[int]$after=120,[string]$align=$null){
  $ppr = "<w:pPr>"
  if($align){ $ppr += "<w:jc w:val='$align'/>" }
  $ppr += "<w:spacing w:after='$after'/></w:pPr>"
  return "<w:p>$ppr$(Run $text $bold $color $szHalf)</w:p>"
}

function PageBreak(){ "<w:p><w:r><w:br w:type='page'/></w:r></w:p>" }

# Section heading with an accent underline
function H2([string]$text){
  $ppr = "<w:pPr><w:spacing w:before='260' w:after='100'/>" +
         "<w:pBdr><w:bottom w:val='single' w:sz='18' w:space='4' w:color='2F7FB8'/></w:pBdr></w:pPr>"
  return "<w:p>$ppr$(Run $text $true '1A3C5E' 32)</w:p>"
}

function H3([string]$text){
  return "<w:p><w:pPr><w:spacing w:before='180' w:after='60'/></w:pPr>$(Run $text $true '2F7FB8' 24)</w:p>"
}

# Bullet: bold lead + normal remainder, hanging indent
function Bullet([string]$lead,[string]$rest){
  $ppr = "<w:pPr><w:spacing w:after='70'/><w:ind w:left='360' w:hanging='360'/></w:pPr>"
  return "<w:p>$ppr$(Run ('-   ' + $lead) $true '2B2B2B' 22)$(Run (' ' + $rest) $false '2B2B2B' 22)</w:p>"
}

# Two-column table: array of @(col0,col1); widths in fiftieths-of-percent
function Table2($headers,$rows,[int]$w0=1700,[int]$w1=3300){
  $b = "<w:tbl><w:tblPr><w:tblW w:w='5000' w:type='pct'/><w:tblLayout w:type='fixed'/><w:tblBorders>"
  foreach($e in 'top','left','bottom','right','insideH','insideV'){
    $b += "<w:$e w:val='single' w:sz='4' w:space='0' w:color='D5DEE7'/>"
  }
  $b += "</w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w='$w0'/><w:gridCol w:w='$w1'/></w:tblGrid>"
  # header
  $b += "<w:tr><w:trPr><w:tblHeader/></w:trPr>"
  $b += "<w:tc><w:tcPr><w:tcW w:w='$w0' w:type='pct'/><w:shd w:val='clear' w:color='auto' w:fill='1A3C5E'/><w:vAlign w:val='center'/></w:tcPr><w:p><w:pPr><w:spacing w:before='50' w:after='50'/></w:pPr>$(Run $headers[0] $true 'FFFFFF' 21)</w:p></w:tc>"
  $b += "<w:tc><w:tcPr><w:tcW w:w='$w1' w:type='pct'/><w:shd w:val='clear' w:color='auto' w:fill='1A3C5E'/><w:vAlign w:val='center'/></w:tcPr><w:p><w:pPr><w:spacing w:before='50' w:after='50'/></w:pPr>$(Run $headers[1] $true 'FFFFFF' 21)</w:p></w:tc>"
  $b += "</w:tr>"
  $r = 0
  foreach($row in $rows){
    $r++
    $fill = if($r % 2 -eq 0){'EEF3F8'}else{'FFFFFF'}
    $shd = "<w:shd w:val='clear' w:color='auto' w:fill='$fill'/>"
    $b += "<w:tr>"
    $b += "<w:tc><w:tcPr><w:tcW w:w='$w0' w:type='pct'/>$shd</w:tcPr><w:p><w:pPr><w:spacing w:before='40' w:after='40'/></w:pPr>$(Run $row[0] $true '1A3C5E' 21)</w:p></w:tc>"
    $b += "<w:tc><w:tcPr><w:tcW w:w='$w1' w:type='pct'/>$shd</w:tcPr><w:p><w:pPr><w:spacing w:before='40' w:after='40'/></w:pPr>$(Run $row[1] $false '2B2B2B' 21)</w:p></w:tc>"
    $b += "</w:tr>"
  }
  $b += "</w:tbl><w:p><w:pPr><w:spacing w:after='160'/></w:pPr></w:p>"
  return $b
}

# Full-width shaded band (single-cell table) holding pre-built paragraphs
function Band([string]$fill,[string]$innerParas){
  $b = "<w:tbl><w:tblPr><w:tblW w:w='5000' w:type='pct'/><w:tblBorders>"
  foreach($e in 'top','left','bottom','right','insideH','insideV'){ $b += "<w:$e w:val='none' w:sz='0' w:space='0' w:color='auto'/>" }
  $b += "</w:tblBorders><w:tblCellMar><w:top w:w='160' w:type='dxa'/><w:left w:w='240' w:type='dxa'/><w:bottom w:w='160' w:type='dxa'/><w:right w:w='240' w:type='dxa'/></w:tblCellMar></w:tblPr>"
  $b += "<w:tblGrid><w:gridCol w:w='9836'/></w:tblGrid>"
  $b += "<w:tr><w:tc><w:tcPr><w:tcW w:w='5000' w:type='pct'/><w:shd w:val='clear' w:color='auto' w:fill='$fill'/></w:tcPr>$innerParas</w:tc></w:tr></w:tbl>"
  return $b
}

# ---------- DATA ----------
$avail = @(
 @('Employee Directory','A single, searchable directory of everyone in the organization. Find any colleague and their details in seconds.'),
 @('Employee Records','Complete, accurate people records maintained in one secure place.'),
 @('Employee Self-Service','Staff view and update their own profile and photo, reducing routine HR requests.'),
 @('Secure Sign-In','Protected login with a guided first-time setup keeps employee data safe.'),
 @('Password Self-Service','Employees reset their own passwords, cutting helpdesk calls.'),
 @('Document Management','Upload, store, and securely retrieve employee documents, with safeguards on file type and size.'),
 @('Works Everywhere','A modern, responsive interface with light and dark modes, on desktop or mobile.')
)
$coreHR = @(
 @('Leave Management','Request and approve time off with live balances and clear approval trails.'),
 @('Time and Attendance','Clock in and out and submit weekly timesheets.'),
 @('Manager Dashboards','At-a-glance views of each manager team, with drill-down to individuals.'),
 @('Notifications','An in-app inbox keeps everyone informed of what needs their attention.'),
 @('Performance Reviews','Structured review cycles with both manager and employee input.'),
 @('Onboarding','A guided, multi-step flow that gets new hires set up smoothly.'),
 @('Audit Trail','A complete, tamper-proof record of changes for compliance and peace of mind.'),
 @('Bulk Operations','Import and export employee data and apply changes in batches.')
)
$ent = @(
 @('HR Help Desk','Employees raise queries and grievances as tracked cases, resolved with clear ownership and timelines.'),
 @('Org Chart and Positions','Visualize reporting lines and headcount across the organization.'),
 @('Attendance and Shifts','Shift rosters, overtime, and attendance management.'),
 @('Expense and Reimbursement','Submit claims with receipts, approved automatically up the management chain.'),
 @('Travel Management','Travel requests, bookings, and per-diem with manager approval.'),
 @('Compliance and Policy','Publish policies and track who has read and acknowledged them.'),
 @('Recruitment','Move candidates through a structured hiring pipeline, with resumes and interview feedback flowing to the right people.'),
 @('Asset Management','Track devices and equipment issued to employees.'),
 @('Offboarding','Smooth, compliant exits with clearance, asset return, and final settlement.'),
 @('Analytics and Reporting','Workforce insights: attrition, headcount, and exportable custom reports.'),
 @('Payroll and Compensation','Salary structures, pay runs, payslips, and statutory deductions.')
)
$plat = @(
 @('Multi-Company (SaaS)','Run multiple organizations on one platform. Each company sees only its own data, fully isolated.'),
 @('Multiple Languages','Use the platform in your team language, with locale-aware dates, numbers, and currency.'),
 @('Granular Permissions','Control precisely who can see and do what, with instant updates when roles change.'),
 @('Real-Time Updates','Live notifications keep everyone working from the latest information.'),
 @('Secure and Reliable','Built on modern, cloud-ready foundations with security and data protection at the core.')
)
$timeline = @(
 @('Core platform: directory, profiles, documents, secure access','Available now'),
 @('Core HR: leave, time, manager dashboards, notifications','Summer 2026'),
 @('Enterprise foundations: multi-company, languages, permissions','Q3 2026'),
 @('Enterprise modules: help desk, expenses, recruitment, assets, analytics','Q4 2026 onward'),
 @('Payroll and Compensation','2027')
)

# ---------- BODY ----------
$body = ""

# Cover band
$coverInner  = "<w:p><w:pPr><w:spacing w:before='220' w:after='60'/></w:pPr>$(Run 'HUMAN RESOURCE MANAGEMENT' $true '9DC3E6' 22)</w:p>"
$coverInner += "<w:p><w:pPr><w:spacing w:after='80'/></w:pPr>$(Run 'NoviManager' $true 'FFFFFF' 76)</w:p>"
$coverInner += "<w:p><w:pPr><w:spacing w:after='240'/></w:pPr>$(Run 'One platform to manage your people, end to end.' $false 'CFE0F0' 30)</w:p>"
$body += Band '1A3C5E' $coverInner
$band2 = "<w:p><w:pPr><w:spacing w:before='40' w:after='40'/></w:pPr>$(Run 'Product Overview      |      June 2026' $false 'FFFFFF' 22)</w:p>"
$body += Band '2F7FB8' $band2

$body += "<w:p><w:pPr><w:spacing w:before='320' w:after='160'/></w:pPr>$(Run 'NoviManager brings your entire workforce into one secure, easy-to-use system - from the employee directory and self-service profiles to documents, leave, time, approvals, and reporting. It replaces scattered spreadsheets and disconnected tools with a single source of truth your whole organization can rely on.' $false '3A3A3A' 24)</w:p>"
$body += P 'It is designed to grow with you: start with core HR today, and add attendance, expenses, recruitment, analytics, and payroll as your needs expand, all within the same familiar platform.' 24 '3A3A3A' $false 160

$body += H3 'Why organizations choose NoviManager'
$body += Bullet 'Less admin, more self-service.' 'Employees update their own details, reset passwords, and access documents, freeing HR for higher-value work.'
$body += Bullet 'Everything in one place.' 'People data, documents, and approvals live together, accurate and always up to date.'
$body += Bullet 'Secure by design.' 'Enterprise-grade sign-in and role-based access keep sensitive employee information protected.'
$body += Bullet 'Built to scale.' 'A multi-company, multi-language foundation supports a single team or a global organization.'
$body += Bullet 'Clear, modern experience.' 'A clean interface that works on any device, with no training overhead.'

$body += PageBreak
$body += H2 'Available today'
$body += P 'Capabilities live in the current release and ready to use.' 22 '2B2B2B' $false 100
$body += Table2 @('Capability','What it means for your organization') $avail

$body += H2 'Coming next - Core HR'
$body += P 'The next wave completes the everyday HR toolkit for employees and managers.' 22 '2B2B2B' $false 100
$body += Table2 @('Module','What it delivers') $coreHR

$body += PageBreak
$body += H2 'Growing with you - Enterprise modules'
$body += P 'As your organization scales, add workflow-driven modules where requests route automatically through the right approvers.' 22 '2B2B2B' $false 100
$body += Table2 @('Module','What it delivers') $ent

$body += H2 'Built for the enterprise'
$body += Table2 @('Capability','What it delivers') $plat

$body += PageBreak
$body += H2 'Indicative timeline'
$body += P 'Target windows for upcoming releases. Sequencing is staged so each module builds on the last.' 22 '2B2B2B' $false 100
$body += Table2 @('Milestone','Target') $timeline 3500 1500

$body += H2 'Find out more'
$body += P 'We would be glad to arrange a live demonstration tailored to your organization needs and discuss a rollout plan that fits your priorities.' 22 '2B2B2B' $false 140
$body += P 'To book a demonstration, please contact your account representative.' 24 '1A3C5E' $true 200
$body += P 'NoviManager - Product Overview, June 2026. Feature availability and timelines are indicative and may change. "Available today" reflects the current release; other items are planned roadmap capabilities.' 18 '8A8A8A' $false 0

$sect = "<w:sectPr><w:pgSz w:w='11906' w:h='16838'/><w:pgMar w:top='1080' w:right='1080' w:bottom='1080' w:left='1080' w:header='720' w:footer='720' w:gutter='0'/></w:sectPr>"

$documentXml = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?>" +
  "<w:document xmlns:w=`"http://schemas.openxmlformats.org/wordprocessingml/2006/main`"><w:body>$body$sect</w:body></w:document>"

$contentTypes = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?>" +
  "<Types xmlns=`"http://schemas.openxmlformats.org/package/2006/content-types`">" +
  "<Default Extension=`"rels`" ContentType=`"application/vnd.openxmlformats-package.relationships+xml`"/>" +
  "<Default Extension=`"xml`" ContentType=`"application/xml`"/>" +
  "<Override PartName=`"/word/document.xml`" ContentType=`"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml`"/>" +
  "</Types>"

$rels = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?>" +
  "<Relationships xmlns=`"http://schemas.openxmlformats.org/package/2006/relationships`">" +
  "<Relationship Id=`"rId1`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument`" Target=`"word/document.xml`"/>" +
  "</Relationships>"

# ---------- ZIP into .docx ----------
$out = Join-Path $env:USERPROFILE 'Downloads\Employee-Manager-Product-Overview.docx'
if (Test-Path $out) { Remove-Item $out -Force }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$fs = [System.IO.File]::Open($out,[System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($fs,[System.IO.Compression.ZipArchiveMode]::Create)
function AddEntry($zip,$name,$content){
  $entry = $zip.CreateEntry($name,[System.IO.Compression.CompressionLevel]::Optimal)
  $s = $entry.Open()
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
  $s.Write($bytes,0,$bytes.Length)
  $s.Dispose()
}
AddEntry $zip '[Content_Types].xml' $contentTypes
AddEntry $zip '_rels/.rels' $rels
AddEntry $zip 'word/document.xml' $documentXml
$zip.Dispose()
$fs.Dispose()
"OK -> $out  ($([math]::Round((Get-Item $out).Length/1kb,1)) KB)"