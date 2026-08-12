"use client";

import { useState, useRef, useEffect } from "react";

export const getPlainText = (html) => {
    if (!html || typeof html !== "string") return "";
    return html
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
};

export default function RichPetitionEditor({
    value = "",
    onChange,
    onBlur,
    placeholder = "Describe details here...",
    minChars = 0,
    maxChars = 2000,
    label = "Petition Details",
    error = null,
}) {
    const editorRef = useRef(null);
    const lastHtmlRef = useRef(value || "");

    const [activeTab, setActiveTab] = useState("visual"); // "visual" | "html" | "preview"
    const [htmlContent, setHtmlContent] = useState(value || "");
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [selectedFont, setSelectedFont] = useState("Outfit");
    const [selectedSize, setSelectedSize] = useState("16px");

    const savedRangeRef = useRef(null);

    const findStyleSpan = (node, styleProp) => {
        if (!node) return null;
        let current = node.nodeType === 1 ? node : node.parentNode;
        while (current && current !== editorRef.current) {
            if (current.tagName === "SPAN" && current.style && current.style[styleProp]) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    };

    const updateToolbarStateFromSelection = (range) => {
        if (!range) return;
        let node = range.commonAncestorContainer;
        if (node.nodeType !== 1) node = node.parentNode;

        if (node && editorRef.current && editorRef.current.contains(node)) {
            const fontSpan = findStyleSpan(node, "fontSize");
            if (fontSpan && fontSpan.style.fontSize) {
                setSelectedSize(fontSpan.style.fontSize);
            }
            const familySpan = findStyleSpan(node, "fontFamily");
            if (familySpan && familySpan.style.fontFamily) {
                setSelectedFont(familySpan.style.fontFamily);
            }
        }
    };

    const saveSelection = () => {
        if (typeof window === "undefined") return;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
                savedRangeRef.current = range.cloneRange();
                updateToolbarStateFromSelection(range);
            }
        }
    };

    const restoreSelection = () => {
        if (typeof window === "undefined" || !savedRangeRef.current) return null;
        const sel = window.getSelection();
        if (sel) {
            try {
                sel.removeAllRanges();
                sel.addRange(savedRangeRef.current);
                return sel;
            } catch (e) {
                console.error("Failed to restore selection:", e);
            }
        }
        return null;
    };

    const getParentBlock = (node) => {
        if (!node) return null;
        let current = node.nodeType === 1 ? node : node.parentNode;
        while (current && current !== editorRef.current) {
            if (["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI"].includes(current.tagName)) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    };

    // Colors
    const [textColor, setTextColor] = useState("#0f172a");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);

    // Sync external value with editor ONLY when value changes externally
    useEffect(() => {
        const incomingVal = value || "";
        if (incomingVal !== lastHtmlRef.current) {
            lastHtmlRef.current = incomingVal;
            setHtmlContent(incomingVal);
            if (editorRef.current && activeTab === "visual") {
                editorRef.current.innerHTML = incomingVal;
            }
        }
    }, [value, activeTab]);

    // Handle tab switching
    useEffect(() => {
        if (activeTab === "visual" && editorRef.current) {
            if (editorRef.current.innerHTML !== htmlContent) {
                editorRef.current.innerHTML = htmlContent;
            }
        }
    }, [activeTab]);

    // Called on every input event in contentEditable
    const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            lastHtmlRef.current = newContent;
            setHtmlContent(newContent);
            if (onChange) onChange(newContent);
        }
    };

    // Smart Paste Handler: Preserves exact paragraph structure, headings, lists, formatting & line breaks
    const handlePaste = (e) => {
        e.preventDefault();

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const pastedHtml = clipboardData.getData("text/html");
        const pastedText = clipboardData.getData("text/plain");

        let finalHtml = "";

        if (pastedHtml && pastedHtml.trim().length > 0) {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(pastedHtml, "text/html");

                // Remove scripts, styles, meta, xml tags
                const elementsToRemove = doc.querySelectorAll("script, style, meta, link, xml, object, embed");
                elementsToRemove.forEach((el) => el.remove());

                // Remove MS Word comments
                const iterator = doc.createNodeIterator(doc.body, NodeFilter.SHOW_COMMENT);
                let commentNode;
                while ((commentNode = iterator.nextNode())) {
                    if (commentNode.parentNode) {
                        commentNode.parentNode.removeChild(commentNode);
                    }
                }

                // Clean attributes & styles from MS Word/Office while preserving semantics
                const body = doc.body;

                // Ensure top-level block structure: wrap orphan text or inline elements into <p> tags
                const newNodes = [];
                let currentP = null;

                Array.from(body.childNodes).forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent;
                        if (text && text.trim().length > 0) {
                            if (!currentP) {
                                currentP = doc.createElement("p");
                                newNodes.push(currentP);
                            }
                            currentP.appendChild(node.cloneNode(true));
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const tag = node.tagName.toLowerCase();
                        const isBlock = [
                            "p",
                            "h1",
                            "h2",
                            "h3",
                            "h4",
                            "h5",
                            "h6",
                            "ul",
                            "ol",
                            "li",
                            "blockquote",
                            "pre",
                            "table",
                            "div",
                            "hr",
                        ].includes(tag);

                        if (isBlock) {
                            currentP = null;
                            if (tag === "div") {
                                // Convert <div> to <p> if it only contains text/inline elements
                                const hasBlockChild = Array.from(node.children).some((child) =>
                                    [
                                        "p",
                                        "h1",
                                        "h2",
                                        "h3",
                                        "h4",
                                        "h5",
                                        "h6",
                                        "ul",
                                        "ol",
                                        "div",
                                        "blockquote",
                                    ].includes(child.tagName.toLowerCase())
                                );
                                if (!hasBlockChild) {
                                    const p = doc.createElement("p");
                                    p.innerHTML = node.innerHTML;
                                    newNodes.push(p);
                                } else {
                                    newNodes.push(node.cloneNode(true));
                                }
                            } else {
                                newNodes.push(node.cloneNode(true));
                            }
                        } else {
                            if (!currentP) {
                                currentP = doc.createElement("p");
                                newNodes.push(currentP);
                            }
                            currentP.appendChild(node.cloneNode(true));
                        }
                    }
                });

                if (newNodes.length > 0) {
                    body.innerHTML = "";
                    newNodes.forEach((n) => body.appendChild(n));
                }

                finalHtml = body.innerHTML;
            } catch (err) {
                console.error("Error parsing pasted HTML:", err);
            }
        }

        // Fallback to plain text with preserved paragraph breaks (\n\n or \n)
        if (!finalHtml || finalHtml.trim().length === 0) {
            if (pastedText) {
                const blocks = pastedText
                    .split(/\r?\n\r?\n/)
                    .map((block) => block.trim())
                    .filter((block) => block.length > 0);

                if (blocks.length > 0) {
                    finalHtml = blocks
                        .map((block) => {
                            const lines = block
                                .split(/\r?\n/)
                                .map((l) => l.trim())
                                .filter((l) => l.length > 0);
                            return `<p>${lines.join("<br>")}</p>`;
                        })
                        .join("");
                } else {
                    finalHtml = `<p>${pastedText.replace(/\r?\n/g, "<br>")}</p>`;
                }
            }
        }

        if (finalHtml) {
            document.execCommand("insertHTML", false, finalHtml);
            handleInput();
        }
    };

    // Called when editing raw HTML in HTML tab
    const handleHtmlChange = (e) => {
        const newContent = e.target.value;
        lastHtmlRef.current = newContent;
        setHtmlContent(newContent);
        if (onChange) onChange(newContent);
    };

    // Rich Text Formatting Commands using document.execCommand
    const exec = (command, val = null) => {
        if (activeTab !== "visual" || !editorRef.current) return;
        editorRef.current.focus();
        restoreSelection();
        document.execCommand(command, false, val);
        saveSelection();
        handleInput();
    };

    // Robust Inline Styling Applicator (Font Family, Font Size, Text Color, Background Color)
    const applyInlineStyle = (styleProp, styleValue, stateSetter) => {
        if (stateSetter) stateSetter(styleValue);
        if (activeTab !== "visual" || !editorRef.current) return;

        editorRef.current.focus();
        let sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
            sel = restoreSelection();
        }

        const isSelectionValid = sel && sel.rangeCount > 0 && editorRef.current.contains(sel.getRangeAt(0).commonAncestorContainer);

        if (!isSelectionValid || sel.isCollapsed) {
            // Apply style to current block or whole editor if no text highlighted
            const targetNode = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).commonAncestorContainer : null;
            const existingSpan = targetNode ? findStyleSpan(targetNode, styleProp) : null;
            
            if (existingSpan) {
                existingSpan.style[styleProp] = styleValue;
            } else {
                const currentBlock = targetNode ? getParentBlock(targetNode) : null;
                if (currentBlock && currentBlock !== editorRef.current) {
                    currentBlock.style[styleProp] = styleValue;
                } else {
                    editorRef.current.style[styleProp] = styleValue;
                }
            }
            saveSelection();
            handleInput();
            return;
        }

        const range = sel.getRangeAt(0);

        // Check if selection is already inside an existing style span
        const parentSpan = findStyleSpan(range.commonAncestorContainer, styleProp);
        const selectedText = range.toString().trim();
        const parentSpanText = parentSpan ? parentSpan.textContent.trim() : "";

        if (parentSpan && (selectedText === parentSpanText || parentSpan.contains(range.commonAncestorContainer))) {
            // Directly update the style on the existing span!
            parentSpan.style[styleProp] = styleValue;

            // Clear any child spans with this style prop to prevent conflicting overrides
            const childSpans = parentSpan.querySelectorAll("span");
            childSpans.forEach((child) => {
                if (child.style && child.style[styleProp]) {
                    child.style.removeProperty(styleProp);
                }
            });

            // Reselect parent span
            const newRange = document.createRange();
            newRange.selectNodeContents(parentSpan);
            sel.removeAllRanges();
            sel.addRange(newRange);
            saveSelection();
            handleInput();
            return;
        }

        // Check if range spans block-level elements
        const fragment = range.cloneContents();
        const hasBlocks = fragment.querySelector("p, div, h1, h2, h3, h4, blockquote, li, ul, ol");

        if (hasBlocks) {
            const container = range.commonAncestorContainer.nodeType === 1 
                ? range.commonAncestorContainer 
                : range.commonAncestorContainer.parentNode;
            
            const blocks = container.querySelectorAll("p, div, h1, h2, h3, h4, blockquote, li");
            let modified = false;
            blocks.forEach((block) => {
                if (sel.containsNode(block, true)) {
                    block.style[styleProp] = styleValue;
                    const childSpans = block.querySelectorAll("span");
                    childSpans.forEach((child) => {
                        if (child.style && child.style[styleProp]) {
                            child.style.removeProperty(styleProp);
                        }
                    });
                    modified = true;
                }
            });

            if (!modified && container.style) {
                container.style[styleProp] = styleValue;
            }
        } else {
            // Standard inline text selection: wrap selection in <span style="...">
            try {
                const contents = range.extractContents();
                const span = document.createElement("span");
                span.style[styleProp] = styleValue;
                span.appendChild(contents);

                // Clean up nested inner spans with same style property to prevent conflict
                const innerSpans = span.querySelectorAll("span");
                innerSpans.forEach((child) => {
                    if (child.style && child.style[styleProp]) {
                        child.style.removeProperty(styleProp);
                    }
                });

                range.insertNode(span);

                // Select newly wrapped span
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                sel.removeAllRanges();
                sel.addRange(newRange);
                saveSelection();
            } catch (e) {
                console.error("Inline style extract error:", e);
                const command = styleProp === "fontFamily" ? "fontName" : styleProp === "fontSize" ? "fontSize" : styleProp === "color" ? "foreColor" : "hiliteColor";
                document.execCommand(command, false, styleValue);
            }
        }

        handleInput();
    };

    // Custom Font Family change
    const applyFontFamily = (fontName) => {
        applyInlineStyle("fontFamily", fontName, setSelectedFont);
    };

    // Custom Font Size change
    const applyFontSize = (sizePx) => {
        applyInlineStyle("fontSize", sizePx, setSelectedSize);
    };

    // Apply Text Color
    const applyTextColor = (color) => {
        setShowTextColorPicker(false);
        applyInlineStyle("color", color, setTextColor);
    };

    // Apply Background / Highlight Color
    const applyBgColor = (color) => {
        setShowBgColorPicker(false);
        applyInlineStyle("backgroundColor", color, setBgColor);
    };

    // Block formatting (Heading 1..4, p, blockquote)
    const applyBlockFormat = (tag) => {
        if (activeTab !== "visual" || !editorRef.current) return;

        editorRef.current.focus();
        let sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
            sel = restoreSelection();
        }

        const targetTag = tag === "paragraph" ? "p" : tag.toLowerCase();

        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
            exec("formatBlock", targetTag);
            return;
        }

        const range = sel.getRangeAt(0);
        const parentBlock = getParentBlock(range.commonAncestorContainer);

        const selectedText = range.toString().trim();
        const blockText = parentBlock ? parentBlock.textContent.trim() : "";

        // If entire block is selected, or changing back to paragraph, or no parent block found
        if (!parentBlock || parentBlock === editorRef.current || selectedText === blockText || targetTag === "p") {
            exec("formatBlock", targetTag);
        } else {
            // Partial selection inside a block: extract selected text into its own heading tag
            try {
                const heading = document.createElement(targetTag);
                heading.appendChild(range.extractContents());

                range.insertNode(heading);

                const newRange = document.createRange();
                newRange.selectNodeContents(heading);
                sel.removeAllRanges();
                sel.addRange(newRange);
                saveSelection();
            } catch (e) {
                console.error("Partial block format error:", e);
                exec("formatBlock", targetTag);
            }
        }

        handleInput();
    };

    // Custom Clear Formatting Handler
    const clearFormatting = () => {
        if (activeTab !== "visual" || !editorRef.current) return;

        editorRef.current.focus();
        let sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
            sel = restoreSelection();
        }

        const isSelectionValid = sel && sel.rangeCount > 0 && editorRef.current.contains(sel.getRangeAt(0).commonAncestorContainer);

        if (!isSelectionValid || sel.isCollapsed) {
            // No selection: clear inline styles from whole editor or current block
            const currentBlock = sel && sel.rangeCount > 0 ? getParentBlock(sel.getRangeAt(0).commonAncestorContainer) : null;
            if (currentBlock && currentBlock !== editorRef.current) {
                currentBlock.removeAttribute("style");
                currentBlock.querySelectorAll("*").forEach((el) => el.removeAttribute("style"));
            } else {
                editorRef.current.removeAttribute("style");
                editorRef.current.querySelectorAll("*").forEach((el) => el.removeAttribute("style"));
            }
        } else {
            const range = sel.getRangeAt(0);

            // Execute native removeFormat first
            document.execCommand("removeFormat", false, null);

            // Process selected container to strip style attributes
            const container = range.commonAncestorContainer.nodeType === 1 
                ? range.commonAncestorContainer 
                : range.commonAncestorContainer.parentNode;

            const styledElems = container.querySelectorAll("[style]");
            styledElems.forEach((el) => {
                if (sel.containsNode(el, true)) {
                    el.removeAttribute("style");
                }
            });

            let parent = container;
            while (parent && parent !== editorRef.current) {
                if (parent.tagName === "SPAN" && parent.hasAttribute("style")) {
                    parent.removeAttribute("style");
                }
                parent = parent.parentNode;
            }

            // Convert selected heading/quote blocks back to standard <p> paragraphs
            const blocks = container.querySelectorAll("h1, h2, h3, h4, h5, h6, blockquote");
            blocks.forEach((block) => {
                if (sel.containsNode(block, true)) {
                    const p = document.createElement("p");
                    p.innerHTML = block.innerHTML;
                    block.parentNode.replaceChild(p, block);
                }
            });
        }

        // Reset toolbar state indicators
        setSelectedFont("Outfit");
        setSelectedSize("16px");
        setTextColor("#0f172a");
        setBgColor("#ffffff");

        saveSelection();
        handleInput();
    };

    // Insert Callout Box
    const insertCallout = () => {
        if (activeTab !== "visual") return;
        const calloutHtml = `<div class="callout-box"><strong>💡 Important Point:</strong> Add key information or evidence here...</div><p><br></p>`;
        exec("insertHTML", calloutHtml);
    };

    // Insert Horizontal Divider
    const insertHr = () => {
        if (activeTab !== "visual") return;
        exec("insertHorizontalRule");
    };

    // Add Link Modal submit
    const handleInsertLink = (e) => {
        e.preventDefault();
        if (!linkUrl) return;
        if (activeTab === "visual") {
            const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
            exec("insertHTML", linkHtml);
        }
        setLinkUrl("");
        setLinkText("");
        setShowLinkModal(false);
    };

    // Clean text calculations
    const cleanText = getPlainText(htmlContent);
    const charCount = cleanText.length;

    // Color palettes
    const textColors = [
        "#0f172a", "#002050", "#F43676", "#0284c7", "#3b82f6",
        "#8b5cf6", "#ef4444", "#f59e0b", "#10b981", "#334155"
    ];

    const bgColors = [
        "transparent", "#fef08a", "#cffaff", "#dcfce7", "#fce7f3",
        "#f3e8ff", "#ffedd5", "#e0f2fe", "#fee2e2", "#f1f5f9"
    ];

    const fontOptions = [
        { label: "Outfit (Sans-serif)", value: "'Outfit', sans-serif" },
        { label: "Inter (Clean)", value: "'Inter', sans-serif" },
        { label: "Playfair Display (Editorial)", value: "'Playfair Display', serif" },
        { label: "Merriweather (Classic Serif)", value: "'Merriweather', serif" },
        { label: "Montserrat (Geometric)", value: "'Montserrat', sans-serif" },
        { label: "Fira Code (Code)", value: "'Fira Code', monospace" },
        { label: "Caveat (Handwritten)", value: "'Caveat', cursive" },
    ];

    const fontSizes = [
        { label: "12px - Small", value: "12px" },
        { label: "14px - Compact", value: "14px" },
        { label: "16px - Regular", value: "16px" },
        { label: "18px - Medium", value: "18px" },
        { label: "20px - Large", value: "20px" },
        { label: "24px - Extra Large", value: "24px" },
        { label: "30px - Heading", value: "30px" },
    ];

    return (
        <div className={`bg-white rounded-2xl border ${error ? 'border-red-400 ring-2 ring-red-400/20' : 'border-gray-200'} shadow-sm overflow-hidden transition-all`}>
            {/* Header Tabs */}
            <div className="bg-gradient-to-r from-[#002050] to-[#1a3a6e] text-white p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
                    <button
                        type="button"
                        onClick={() => setActiveTab("visual")}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            activeTab === "visual"
                                ? "bg-[#F43676] text-white shadow-xs font-semibold"
                                : "text-gray-200 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <i className="fas fa-edit text-xs"></i>
                        Visual Editor
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("html")}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            activeTab === "html"
                                ? "bg-[#F43676] text-white shadow-xs font-semibold"
                                : "text-gray-200 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <i className="fas fa-code text-xs"></i>
                        HTML
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            activeTab === "preview"
                                ? "bg-[#F43676] text-white shadow-xs font-semibold"
                                : "text-gray-200 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <i className="fas fa-eye text-xs"></i>
                        Preview
                    </button>
                </div>

                <div className="text-xs text-white/80 font-medium">
                    <span>{charCount} / {maxChars} characters</span>
                    {minChars > 0 && charCount < minChars && (
                        <span className="text-pink-300 ml-2 font-bold">(min {minChars})</span>
                    )}
                </div>
            </div>

            {/* Formatting Toolbar */}
            {activeTab === "visual" && (
                <div className="bg-slate-50 border-b border-gray-200 p-2.5 flex flex-wrap items-center gap-1.5 text-xs sticky top-0 z-20">
                    {/* Font Family Selector */}
                    <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1">
                        <i className="fas fa-font text-gray-500 text-[11px]"></i>
                        <select
                            value={selectedFont}
                            onMouseDown={saveSelection}
                            onChange={(e) => applyFontFamily(e.target.value)}
                            className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer pr-1"
                        >
                            {fontOptions.map((f) => (
                                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                                    {f.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Font Size Selector */}
                    <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1">
                        <i className="fas fa-text-height text-gray-500 text-[11px]"></i>
                        <select
                            value={selectedSize}
                            onMouseDown={saveSelection}
                            onChange={(e) => applyFontSize(e.target.value)}
                            className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer pr-1"
                        >
                            {fontSizes.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Format Block */}
                    <select
                        onMouseDown={saveSelection}
                        onChange={(e) => applyBlockFormat(e.target.value)}
                        defaultValue="p"
                        className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 outline-none cursor-pointer"
                    >
                        <option value="p">Paragraph</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="blockquote">Quote Block</option>
                    </select>

                    <div className="h-5 w-[1px] bg-gray-300 mx-0.5"></div>

                    {/* Formatting Buttons */}
                    <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={() => exec("bold")}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-700 font-bold cursor-pointer"
                            title="Bold"
                        >
                            <i className="fas fa-bold"></i>
                        </button>
                        <button
                            type="button"
                            onClick={() => exec("italic")}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-700 italic cursor-pointer"
                            title="Italic"
                        >
                            <i className="fas fa-italic"></i>
                        </button>
                        <button
                            type="button"
                            onClick={() => exec("underline")}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-700 underline cursor-pointer"
                            title="Underline"
                        >
                            <i className="fas fa-underline"></i>
                        </button>
                        <button
                            type="button"
                            onClick={() => exec("strikeThrough")}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-700 line-through cursor-pointer"
                            title="Strikethrough"
                        >
                            <i className="fas fa-strikethrough"></i>
                        </button>
                    </div>

                    {/* Color Pickers */}
                    <div className="relative flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowTextColorPicker(!showTextColorPicker);
                                    setShowBgColorPicker(false);
                                }}
                                className="w-6 h-6 rounded hover:bg-gray-100 flex flex-col items-center justify-center text-gray-700 cursor-pointer"
                                title="Text Color"
                            >
                                <span className="font-bold text-[10px]">A</span>
                                <span className="w-3.5 h-0.5 rounded-full" style={{ backgroundColor: textColor }}></span>
                            </button>

                            {showTextColorPicker && (
                                <div className="absolute top-8 left-0 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-2.5 w-44 space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Text Color</p>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {textColors.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => applyTextColor(c)}
                                                className="w-5 h-5 rounded-full border border-gray-300 shadow-xs hover:scale-110 transition-transform cursor-pointer"
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <div className="pt-1.5 border-t border-gray-100 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={textColor}
                                            onChange={(e) => applyTextColor(e.target.value)}
                                            className="w-6 h-6 rounded cursor-pointer border-0"
                                        />
                                        <span className="text-xs font-mono">{textColor}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowBgColorPicker(!showBgColorPicker);
                                    setShowTextColorPicker(false);
                                }}
                                className="w-6 h-6 rounded hover:bg-gray-100 flex flex-col items-center justify-center text-gray-700 cursor-pointer"
                                title="Highlight Color"
                            >
                                <i className="fas fa-highlighter text-[10px]"></i>
                                <span className="w-3.5 h-0.5 rounded-full border" style={{ backgroundColor: bgColor }}></span>
                            </button>

                            {showBgColorPicker && (
                                <div className="absolute top-8 left-0 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-2.5 w-44 space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Highlight</p>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {bgColors.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => applyBgColor(c)}
                                                className="w-5 h-5 rounded-full border border-gray-300 shadow-xs hover:scale-110 transition-transform cursor-pointer"
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <div className="pt-1.5 border-t border-gray-100 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={bgColor === "transparent" ? "#ffffff" : bgColor}
                                            onChange={(e) => applyBgColor(e.target.value)}
                                            className="w-6 h-6 rounded cursor-pointer border-0"
                                        />
                                        <span className="text-xs font-mono">{bgColor}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-5 w-[1px] bg-gray-300 mx-0.5"></div>

                    {/* Lists */}
                    <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={() => exec("insertUnorderedList")}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                            title="Bullet List"
                        >
                            <i className="fas fa-list-ul"></i>
                        </button>
                        <button
                            type="button"
                            onClick={() => exec("insertOrderedList")}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                            title="Numbered List"
                        >
                            <i className="fas fa-list-ol"></i>
                        </button>
                    </div>

                    {/* Link & Callout */}
                    <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={() => setShowLinkModal(true)}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-[#0284c7] cursor-pointer"
                            title="Insert Link"
                        >
                            <i className="fas fa-link"></i>
                        </button>
                        <button
                            type="button"
                            onClick={insertCallout}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-amber-500 cursor-pointer"
                            title="Highlight Callout Box"
                        >
                            <i className="fas fa-lightbulb"></i>
                        </button>
                        <button
                            type="button"
                            onClick={insertHr}
                            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
                            title="Horizontal Line"
                        >
                            <i className="fas fa-minus"></i>
                        </button>
                    </div>

                    {/* Clear Formatting */}
                    <button
                        type="button"
                        onMouseDown={saveSelection}
                        onClick={clearFormatting}
                        className="w-6 h-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center text-red-500 ml-auto cursor-pointer"
                        title="Clear Formatting"
                    >
                        <i className="fas fa-eraser"></i>
                    </button>
                </div>
            )}

            {/* TAB CONTENT */}
            <div className="p-3 bg-white min-h-[160px]">
                {activeTab === "visual" && (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onPaste={handlePaste}
                        onBlur={(e) => {
                            saveSelection();
                            if (onBlur) onBlur(e);
                        }}
                        onMouseUp={saveSelection}
                        onKeyUp={saveSelection}
                        onSelect={saveSelection}
                        className="prose max-w-none p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F43676]/20 focus:border-[#F43676] transition-all bg-white min-h-[160px] outline-none leading-relaxed text-sm text-[#302d55]"
                        data-placeholder={placeholder}
                    />
                )}

                {activeTab === "html" && (
                    <textarea
                        value={htmlContent}
                        onChange={handleHtmlChange}
                        onBlur={onBlur}
                        rows={8}
                        className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 outline-none focus:ring-2 focus:ring-[#F43676]/40 leading-relaxed"
                    />
                )}

                {activeTab === "preview" && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[160px]">
                        <div
                            className="prose max-w-none text-slate-800 text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: htmlContent || "<p class='text-gray-400 italic'>No content written...</p>" }}
                        />
                    </div>
                )}
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <i className="fas fa-link text-[#F43676]"></i>
                                Insert Link
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowLinkModal(false)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleInsertLink} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">URL *</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#F43676] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Text (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Click here..."
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#F43676] outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkModal(false)}
                                    className="px-3 py-1.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-[#F43676] text-white font-medium rounded-lg hover:bg-[#e02a60] cursor-pointer"
                                >
                                    Add Link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
