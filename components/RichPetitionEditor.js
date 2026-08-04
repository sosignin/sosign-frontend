"use client";

import { useState, useRef, useEffect } from "react";

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

    // Called when editing raw HTML in HTML tab
    const handleHtmlChange = (e) => {
        const newContent = e.target.value;
        lastHtmlRef.current = newContent;
        setHtmlContent(newContent);
        if (onChange) onChange(newContent);
    };

    // Rich Text Formatting Commands using document.execCommand
    const exec = (command, val = null) => {
        if (activeTab !== "visual") return;
        document.execCommand(command, false, val);
        handleInput();
        if (editorRef.current) editorRef.current.focus();
    };

    // Custom Font Family change
    const applyFontFamily = (fontName) => {
        setSelectedFont(fontName);
        if (activeTab !== "visual" || !editorRef.current) return;

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement("span");
            span.style.fontFamily = fontName;
            span.appendChild(range.extractContents());
            range.insertNode(span);
        } else {
            const currentHtml = editorRef.current.innerHTML;
            if (currentHtml.trim()) {
                editorRef.current.innerHTML = `<div style="font-family: ${fontName}">${currentHtml}</div>`;
            } else {
                exec("fontName", fontName);
            }
        }
        handleInput();
    };

    // Custom Font Size change
    const applyFontSize = (sizePx) => {
        setSelectedSize(sizePx);
        if (activeTab !== "visual" || !editorRef.current) return;

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement("span");
            span.style.fontSize = sizePx;
            span.appendChild(range.extractContents());
            range.insertNode(span);
        } else {
            const currentHtml = editorRef.current.innerHTML;
            if (currentHtml.trim()) {
                editorRef.current.innerHTML = `<div style="font-size: ${sizePx}">${currentHtml}</div>`;
            }
        }
        handleInput();
    };

    // Apply Text Color
    const applyTextColor = (color) => {
        setTextColor(color);
        setShowTextColorPicker(false);
        if (activeTab !== "visual" || !editorRef.current) return;

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement("span");
            span.style.color = color;
            span.appendChild(range.extractContents());
            range.insertNode(span);
        } else {
            exec("foreColor", color);
        }
        handleInput();
    };

    // Apply Background / Highlight Color
    const applyBgColor = (color) => {
        setBgColor(color);
        setShowBgColorPicker(false);
        if (activeTab !== "visual" || !editorRef.current) return;

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement("span");
            span.style.backgroundColor = color;
            span.style.padding = "2px 4px";
            span.style.borderRadius = "4px";
            span.appendChild(range.extractContents());
            range.insertNode(span);
        } else {
            exec("hiliteColor", color);
        }
        handleInput();
    };

    // Block formatting (Heading 1..4, p, blockquote)
    const applyBlockFormat = (tag) => {
        if (activeTab !== "visual") return;
        if (tag === "blockquote") {
            exec("formatBlock", "blockquote");
        } else if (tag.startsWith("h")) {
            exec("formatBlock", tag);
        } else {
            exec("formatBlock", "p");
        }
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
    const cleanText = htmlContent.replace(/<[^>]*>/g, "").trim();
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
                        onClick={() => exec("removeFormat")}
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
                        onBlur={onBlur}
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
