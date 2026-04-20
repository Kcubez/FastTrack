"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Zap, Sparkles, RefreshCw, Save, Send, Copy, CheckCircle,
  ChevronDown, X, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Form Options ────────────────────────────────────────────────────────────

const PLATFORMS = [
  "Facebook Post", "Facebook Ad Copy", "Instagram Caption", "LinkedIn Post",
  "X (Twitter) Post", "TikTok Caption", "YouTube Description", "Telegram Post", "Blog",
];

const CONTENT_GOALS = [
  "Brand Awareness", "Product Promotion", "Lead Generation", "Engagement Boost",
  "Educational Content", "Event Promotion", "Community Building",
  "Announcement / Update", "Traffic to Website", "Offer / Discount Promotion",
];

const TARGET_AUDIENCES = [
  "General Consumers", "Business Owners", "Young Adults", "Students", "Parents",
  "Job Seekers", "Corporate Professionals", "Travelers", "Existing Customers", "New Prospects",
];

const WRITING_TONES = [
  "Professional", "Friendly", "Conversational", "Persuasive", "Educational",
  "Inspirational", "Corporate", "Casual", "Luxury / Premium", "Youthful / Trendy",
];

const CONTENT_LENGTHS = [
  { label: "Short (50–80 words)", value: "Short" },
  { label: "Medium (80–150 words)", value: "Medium" },
  { label: "Long (150–300 words)", value: "Long" },
  { label: "Extended (300–500 words)", value: "Extended" },
  { label: "Custom word count", value: "Custom" },
];

const OUTPUT_LANGUAGES = [
  "English", "Myanmar (Burmese)", "English + Myanmar", "Business English",
];

const CTA_TYPES = [
  "No CTA", "Learn More", "Contact Us", "Message Us", "Call Now",
  "Shop Now", "Book Now", "Register Today", "Visit Website", "Follow Page",
];

const HASHTAG_PREFS = [
  "None", "Minimal (1–3)", "Standard (3–5)", "High (5–8)", "Custom",
];

const NEGATIVE_CONSTRAINTS_OPTIONS = [
  "Avoid price mention", "Avoid competitor mention", "Avoid slang",
  "Avoid sensitive topics", "Avoid medical claims", "Avoid political references",
  "Avoid exaggerated promises",
];

// ─── Select Component ─────────────────────────────────────────────────────────

function FormSelect({
  label, value, onChange, options, placeholder, required = false
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[] | { label: string; value: string }[];
  placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">
        {label} {required && <span className="text-violet-400">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all appearance-none pr-10 text-sm"
          required={required}
        >
          <option value="" className="bg-slate-900">{placeholder ?? "Select..."}</option>
          {options.map((opt) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
            ) : (
              <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
            )
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function FormInput({
  label, value, onChange, placeholder, required = false, type = "text"
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">
        {label} {required && <span className="text-violet-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateContentPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [editedContent, setEditedContent] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [platform, setPlatform] = useState("");
  const [contentGoal, setContentGoal] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [customAudience, setCustomAudience] = useState("");
  const [writingTone, setWritingTone] = useState("");
  const [contentLength, setContentLength] = useState("Medium");
  const [customWordCount, setCustomWordCount] = useState("");
  const [outputLanguage, setOutputLanguage] = useState("English");
  const [ctaType, setCtaType] = useState("No CTA");
  const [hashtagPreference, setHashtagPreference] = useState("None");
  const [customHashtags, setCustomHashtags] = useState("");
  const [keywords, setKeywords] = useState("");
  const [wordsToAvoid, setWordsToAvoid] = useState("");
  const [negativeConstraints, setNegativeConstraints] = useState<string[]>([]);
  const [emojiEnabled, setEmojiEnabled] = useState(true);
  const [customNegativeConstraint, setCustomNegativeConstraint] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const toggleConstraint = (c: string) => {
    setNegativeConstraints((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const buildPayload = () => ({
    title, brief, platform, contentGoal, targetAudience, customAudience,
    writingTone, contentLength, customWordCount: customWordCount ? parseInt(customWordCount) : null,
    outputLanguage, ctaType, hashtagPreference, customHashtags, keywords,
    wordsToAvoid, 
    negativeConstraints: [
      ...negativeConstraints,
      ...(customNegativeConstraint ? [customNegativeConstraint] : [])
    ].join(", "), 
    emojiEnabled,
    image: imagePreview ? {
      data: imagePreview.split(",")[1],
      mimeType: imageFile?.type || "image/jpeg"
    } : null,
  });

  const handleGenerate = async () => {
    if (!title || !brief || !platform || !contentGoal || !targetAudience || !writingTone) {
      toast.error("Please fill in all required fields");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setGeneratedContent(data.content);
      setEditedContent(data.content);
      toast.success("Content generated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!editedContent) {
      toast.error("Generate content first");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), generatedContent: editedContent, status }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(status === "published" ? "Content published!" : "Saved as draft!");
      router.push("/dashboard/library");
    } catch {
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </span>
          Create Content
        </h1>
        <p className="text-slate-400 mt-2">Fill in the details below to generate AI-powered content.</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* ─── INPUT FORM ─── */}
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs text-violet-400 font-bold">1</span>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                label="Content Title" value={title} onChange={setTitle}
                placeholder="e.g., Summer Sale Announcement" required
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Topic / Brief <span className="text-violet-400">*</span>
                </label>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe what the content is about, key messages, product details..."
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm resize-none"
                />
              </div>
              <FormSelect label="Platform" value={platform} onChange={setPlatform} options={PLATFORMS} placeholder="Select platform" required />
              <FormSelect label="Content Goal" value={contentGoal} onChange={setContentGoal} options={CONTENT_GOALS} placeholder="Select goal" required />
              
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Product Image (optional)</label>
                <div className="flex flex-col gap-3">
                  {imagePreview && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 4 * 1024 * 1024) {
                          toast.error("File is too large. Maximum size is 4MB.");
                          e.target.value = "";
                          return;
                        }
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">Supported: JPG, PNG, WebP (Max 4MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">2</span>
                Audience & Tone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSelect label="Target Audience" value={targetAudience} onChange={setTargetAudience} options={TARGET_AUDIENCES} placeholder="Select audience" required />
              <FormInput label="Custom Audience (optional)" value={customAudience} onChange={setCustomAudience} placeholder="e.g., Tech-savvy millennials in Yangon" />
              <FormSelect label="Writing Tone" value={writingTone} onChange={setWritingTone} options={WRITING_TONES} placeholder="Select tone" required />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 font-bold">3</span>
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSelect label="Content Length" value={contentLength} onChange={setContentLength} options={CONTENT_LENGTHS} />
              {contentLength === "Custom" && (
                <FormInput label="Custom Word Count" value={customWordCount} onChange={setCustomWordCount} placeholder="e.g., 200" type="number" />
              )}
              <FormSelect label="Output Language" value={outputLanguage} onChange={setOutputLanguage} options={OUTPUT_LANGUAGES} />
              <FormSelect label="CTA Type (optional)" value={ctaType} onChange={setCtaType} options={CTA_TYPES} />

              {/* Emoji Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">😊</span>
                  <div>
                    <p className="text-sm font-medium text-slate-300">Emoji Usage</p>
                    <p className="text-xs text-slate-500">Include relevant emojis in content</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmojiEnabled(!emojiEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emojiEnabled ? "bg-violet-600" : "bg-slate-700"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emojiEnabled ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs text-amber-400 font-bold">4</span>
                Advanced Options
                <span className="text-xs text-slate-500 font-normal ml-1">(optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSelect label="Hashtag Preference" value={hashtagPreference} onChange={setHashtagPreference} options={HASHTAG_PREFS} />
              {hashtagPreference === "Custom" && (
                <FormInput label="Custom Hashtags" value={customHashtags} onChange={setCustomHashtags} placeholder="#myband #sale #myanmar" />
              )}
              <FormInput label="Keywords to Include" value={keywords} onChange={setKeywords} placeholder="sale, discount, exclusive, limited" />
              <FormInput label="Words to Avoid" value={wordsToAvoid} onChange={setWordsToAvoid} placeholder="cheap, bad, problem" />

              {/* Negative Constraints */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Content Restrictions
                  <span className="ml-1.5 text-xs font-normal text-slate-500">(check to block)</span>
                </label>
                <div className="bg-slate-800/40 border border-slate-700 rounded-xl divide-y divide-slate-700/50 overflow-hidden">
                  {NEGATIVE_CONSTRAINTS_OPTIONS.map((c) => {
                    const isChecked = negativeConstraints.includes(c);
                    return (
                      <label
                        key={c}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleConstraint(c)}
                          className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                        />
                        <span className={`text-sm ${isChecked ? "text-orange-300 line-through decoration-orange-500/50" : "text-slate-300"}`}>
                          {c}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 leading-none">
                  <FormInput 
                    label="Custom Constraint" 
                    value={customNegativeConstraint} 
                    onChange={setCustomNegativeConstraint} 
                    placeholder="e.g., Don't mention the founder" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-14 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-base rounded-xl shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        {/* ─── OUTPUT PANEL ─── */}
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Generated Content
                </CardTitle>
                {editedContent && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!generatedContent && !generating && (
                <div className="min-h-75 flex flex-col items-center justify-center text-center p-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-violet-400/60" />
                  </div>
                  <p className="text-slate-400 font-medium">Your AI-generated content will appear here</p>
                  <p className="text-slate-600 text-sm mt-2">Fill in the form and click Generate</p>
                </div>
              )}

              {generating && (
                <div className="min-h-75 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                    <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
                  </div>
                  <p className="text-violet-300 font-medium">AI is writing your content...</p>
                  <p className="text-slate-500 text-sm mt-2">This may take a few seconds</p>
                </div>
              )}

              {editedContent && !generating && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300 text-sm">Content generated! You can edit below before saving.</span>
                  </div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={14}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm resize-none"
                    placeholder="Generated content appears here..."
                  />

                  {/* Metadata hint */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Info className="w-3.5 h-3.5" />
                    <span>{editedContent.split(/\s+/).filter(Boolean).length} words · {platform} · {outputLanguage}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={generating}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Regenerate
                    </Button>
                    <Button
                      onClick={() => handleSave("draft")}
                      disabled={saving}
                      variant="outline"
                      className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded-xl"
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={() => handleSave("published")}
                      disabled={saving}
                      className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      Publish
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
