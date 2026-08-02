interface DocumentSection {
    number: string
    heading: string
    bodyHtml: string
}

interface ParsedDocument {
    introHtml: string
    sections: DocumentSection[]
}

// Splits already-sanitized page HTML on top-level <h2> boundaries. Content
// before the first <h2> becomes the header intro; each <h2> starts a section.
// A heading's own leading number ("3. Payments") moves into the section badge
// so the document keeps its authored numbering; unnumbered headings fall back
// to their position.
export function parseDocument(sanitizedHtml: string): ParsedDocument {
    const doc = new DOMParser().parseFromString(sanitizedHtml, 'text/html')
    const intro = doc.createElement('div')
    const rawSections: { heading: string; container: HTMLElement }[] = []
    let current: HTMLElement | null = null

    for (const node of Array.from(doc.body.childNodes)) {
        if (node.nodeName === 'H2') {
            current = doc.createElement('div')
            rawSections.push({heading: node.textContent?.trim() ?? '', container: current})
        } else {
            ;(current ?? intro).appendChild(node.cloneNode(true))
        }
    }

    const sections = rawSections.map(({heading, container}, index) => {
        const numbered = /^(\d+)[.)]\s*(.+)$/.exec(heading)
        return {
            number: (numbered ? numbered[1] : String(index + 1)).padStart(2, '0'),
            heading: numbered ? numbered[2] : heading,
            bodyHtml: container.innerHTML,
        }
    })

    return {introHtml: intro.innerHTML, sections}
}