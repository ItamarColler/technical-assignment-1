---
name: XLSX Namespace and Relationship Type URIs
description: Exact verified namespace URIs and relationship type URIs for .xlsx files — single character errors break validation
type: reference
---

## XML Namespace URIs (use="xmlns" declarations)

| Prefix | URI |
|--------|-----|
| (default) | `http://schemas.openxmlformats.org/spreadsheetml/2006/main` |
| r | `http://schemas.openxmlformats.org/officeDocument/2006/relationships` |
| Relationships | `http://schemas.openxmlformats.org/package/2006/relationships` |
| Content_Types | `http://schemas.openxmlformats.org/package/2006/content-types` |

## Relationship Type URIs (use in Type= attributes in .rels files)

All use `http://` (NOT `https://`) — this is a URI identifier, not a live URL.

| Purpose | Type URI |
|---------|----------|
| Workbook (package-level) | `http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument` |
| Worksheet | `http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet` |
| Styles | `http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles` |
| Shared Strings | `http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings` |
| Theme | `http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme` |

## Content Types

| Part | Content Type |
|------|-------------|
| workbook.xml | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml` |
| sheet1.xml | `application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml` |
| styles.xml | `application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml` |
| sharedStrings.xml | `application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml` |
| .rels files | `application/vnd.openxmlformats-package.relationships+xml` |
