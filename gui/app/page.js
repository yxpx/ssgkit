"use client";

import { useRef, useState } from "react";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "publications", label: "Publications" },
  { id: "projects", label: "Projects" },
  { id: "teaching", label: "Teaching" },
  { id: "cv", label: "CV + Links" },
  { id: "settings", label: "Site Settings" }
];

const newPublication = () => ({
  title: "",
  authors: "",
  venue: "",
  year: "",
  summary: "",
  links: "",
  content: ""
});

const newTeaching = () => ({
  course: "",
  semester: "",
  notes: "",
  materialsUrl: ""
});

const newProject = () => ({
  title: "",
  period: "",
  summary: "",
  link: ""
});

const REQUIRED_PROFILE_FIELDS = ["siteName", "role", "institution", "department", "email"];
const REQUIRED_PUBLICATION_FIELDS = ["title", "authors", "venue", "year"];
const REQUIRED_TEACHING_FIELDS = ["course", "semester"];

const PLACEHOLDER_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect width="60" height="60" fill="#f1f1f1"/><circle cx="30" cy="22" r="10" fill="#c5c5c5"/><path d="M10 54c2-10 10-16 20-16s18 6 20 16" fill="#c5c5c5"/></svg>'
  );

const demoData = {
  siteName: "Dr. Priya Mehta",
  role: "Associate Professor",
  institution: "KJSSE",
  department: "Department of Computer Science and Engineering",
  office: "Room 412, KReSIT Building",
  email: "priya.mehta@somaiya.edu",
  location: "Mumbai, Maharashtra",
  scholarUrl: "https://scholar.google.com/citations?user=abcd1234",
  githubUrl: "https://github.com/priyamehta",
  linkedinUrl: "",
  cvUrl: "https://example.edu/priya-mehta-cv.pdf",
  profileImageUrl: "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=",
  profileImageUpload: "",
  tagline: "I work on human-computer interaction and accessibility in low-resource settings.",
  shortBio:
    "Dr. Mehta joined KJSSE in 2018 after completing her postdoc at CMU. She leads the Accessible Computing Lab, mentoring graduate and undergraduate researchers across accessibility, HCI systems, and responsible AI.",
  longBio:
    "Dr. Priya Mehta's research spans inclusive interfaces, assistive technologies, and participatory design methods for multilingual communities.\n\nBefore KJSSE, she worked with civic tech organizations and public education groups to deploy low-bandwidth learning and health interfaces in regional languages.\n\nHer lab collaborates closely with schools, NGOs, and public agencies to ensure systems are practical, equitable, and evidence-driven.",
  homeIntro:
    "Welcome to my academic profile. My lab studies equitable computing systems for everyday users in emerging contexts.\n\nOur current projects explore multilingual voice interfaces, low-bandwidth accessibility, and participatory evaluation methods that place communities at the center of design.",
  publications: [
    {
      title: "Designing Voice Interfaces for Multilingual Households",
      authors: "Priya Mehta, A. Kulkarni, S. Rao",
      venue: "CHI",
      year: "2024",
      summary: "A mixed-method study on accessibility barriers in domestic voice assistants.",
      links: "https://doi.org/10.1145/example1, https://arxiv.org/abs/2401.01010",
      content: "This paper presents a field deployment and design recommendations for multilingual accessibility."
    },
    {
      title: "Low-Bandwidth Accessibility for Rural Learning Platforms",
      authors: "P. Mehta, R. Singh",
      venue: "CSCW",
      year: "2023",
      summary: "Interventions for improving assistive features under constrained network conditions.",
      links: "https://doi.org/10.1145/example2",
      content: "We report results from a two-year collaboration with public schools in Maharashtra."
    },
    {
      title: "Participatory Audits of Public Service Kiosks",
      authors: "Priya Mehta, N. Iyer, K. Patil",
      venue: "ASSETS",
      year: "2022",
      summary: "A framework for accessibility audits led by local community participants.",
      links: "https://doi.org/10.1145/example3",
      content: "The study introduces an audit toolkit and policy recommendations."
    }
  ],
  projects: [
    {
      title: "Inclusive Voice Tutor for Government Schools",
      period: "2025 - Ongoing",
      summary:
        "A multilingual voice-assisted tutoring platform designed for low-connectivity classrooms with teacher-in-the-loop controls.",
      link: "https://drive.google.com/drive/folders/example-voice-tutor"
    },
    {
      title: "Accessible Public Health Kiosk Toolkit",
      period: "2024 - 2025",
      summary:
        "Open toolkit for evaluating and improving kiosk accessibility in district hospitals, developed with public-sector partners.",
      link: "https://github.com/priyamehta/health-kiosk-accessibility"
    }
  ],
  teaching: [
    {
      course: "CS747: Foundations of Human-Computer Interaction",
      semester: "Autumn 2025",
      notes: "Graduate elective on user research, prototyping, and evaluation with a studio component and weekly critique sessions.",
      materialsUrl: "https://drive.google.com/drive/folders/example-cs747"
    },
    {
      course: "CS251: Software Systems Lab",
      semester: "Spring 2025",
      notes: "Core undergraduate lab with emphasis on accessible interface engineering, code review discipline, and deployment workflows.",
      materialsUrl: "https://drive.google.com/drive/folders/example-cs251"
    }
  ],
  includeAbout: true,
  includePublications: true,
  includeProjects: true,
  includeTeaching: true,
  primaryColor: "#0b4aa6",
  accentColor: "#08357a"
};

const initialState = {
  siteName: "Your Name",
  role: "Assistant Professor",
  institution: "Your University",
  department: "Department of Computer Science",
  office: "Room 000",
  email: "",
  location: "",
  scholarUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  cvUrl: "",
  profileImageUrl: "",
  profileImageUpload: "",
  tagline: "Research interests and concise profile summary.",
  shortBio: "Brief biography for homepage.",
  longBio: "Extended biography for about page.",
  homeIntro: "Welcome text for the homepage.",
  publications: [newPublication()],
  projects: [newProject()],
  teaching: [newTeaching()],
  includeAbout: true,
  includePublications: true,
  includeProjects: true,
  includeTeaching: true,
  primaryColor: "#0b4aa6",
  accentColor: "#08357a"
};

export default function DashboardPage() {
  const [form, setForm] = useState(initialState);
  const [activeTab, setActiveTab] = useState("profile");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [showValidationBanner, setShowValidationBanner] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const toastTimerRef = useRef(null);

  function fieldId(path) {
    return `field-${path.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  }

  function clearFieldError(path) {
    setErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }

  function markField(path) {
    return errors[path] ? "field has-error" : "field";
  }

  function getInitials(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "N";
    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase());
    return initials.join("");
  }

  function getPhotoPreview() {
    if (form.profileImageUpload) return form.profileImageUpload;
    if (form.profileImageUrl) return form.profileImageUrl;
    return PLACEHOLDER_AVATAR;
  }

  function setToastWithTimeout(message) {
    setToast(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 3000);
  }

  function loadDemo() {
    setForm(demoData);
    setActiveTab("profile");
    setErrors({});
    setShowValidationBanner(false);
    setStatus("");
    setToastWithTimeout("Demo data loaded — click Generate ZIP to preview");
  }

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(`profile.${name}`);

    if (name === "includePublications" && value === false) {
      setErrors((prev) => {
        const next = {};
        for (const [key, message] of Object.entries(prev)) {
          if (!key.startsWith("publications.")) {
            next[key] = message;
          }
        }
        return next;
      });
    }

    if (name === "includeTeaching" && value === false) {
      setErrors((prev) => {
        const next = {};
        for (const [key, message] of Object.entries(prev)) {
          if (!key.startsWith("teaching.")) {
            next[key] = message;
          }
        }
        return next;
      });
    }

      if (name === "includeProjects" && value === false) {
        setErrors((prev) => {
          const next = {};
          for (const [key, message] of Object.entries(prev)) {
            if (!key.startsWith("projects.")) {
              next[key] = message;
            }
          }
          return next;
        });
      }
  }

  function updatePublication(index, key, value) {
    setForm((prev) => {
      const next = [...prev.publications];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, publications: next };
    });
    clearFieldError(`publications.${index}.${key}`);
  }

  function addPublication() {
    setForm((prev) => ({ ...prev, publications: [...prev.publications, newPublication()] }));
  }

  function removePublication(index) {
    setForm((prev) => {
      const next = prev.publications.filter((_, i) => i !== index);
      return { ...prev, publications: next.length ? next : [newPublication()] };
    });
  }

  function updateTeaching(index, key, value) {
    setForm((prev) => {
      const next = [...prev.teaching];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, teaching: next };
    });
    clearFieldError(`teaching.${index}.${key}`);
  }

  function addTeaching() {
    setForm((prev) => ({ ...prev, teaching: [...prev.teaching, newTeaching()] }));
  }

  function updateProject(index, key, value) {
    setForm((prev) => {
      const next = [...prev.projects];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, projects: next };
    });
    clearFieldError(`projects.${index}.${key}`);
  }

  function addProject() {
    setForm((prev) => ({ ...prev, projects: [...prev.projects, newProject()] }));
  }

  function removeProject(index) {
    setForm((prev) => {
      const next = prev.projects.filter((_, i) => i !== index);
      return { ...prev, projects: next.length ? next : [newProject()] };
    });
  }

  function removeTeaching(index) {
    setForm((prev) => {
      const next = prev.teaching.filter((_, i) => i !== index);
      return { ...prev, teaching: next.length ? next : [newTeaching()] };
    });
  }

  function handlePhotoFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setForm((prev) => ({ ...prev, profileImageUpload: result }));
      clearFieldError("profile.profileImageUrl");
    };
    reader.readAsDataURL(file);
  }

  function validateForm() {
    const nextErrors = {};

    for (const field of REQUIRED_PROFILE_FIELDS) {
      if (!String(form[field] || "").trim()) {
        nextErrors[`profile.${field}`] = "This field is required";
      }
    }

    if (form.includePublications) {
      form.publications.forEach((item, index) => {
        for (const field of REQUIRED_PUBLICATION_FIELDS) {
          if (!String(item[field] || "").trim()) {
            nextErrors[`publications.${index}.${field}`] = "This field is required";
          }
        }

        if (String(item.year || "").trim() && !/^\d{4}$/.test(String(item.year).trim())) {
          nextErrors[`publications.${index}.year`] = "Use a 4-digit year (e.g. 2024)";
        }
      });
    }

    if (form.includeTeaching) {
      form.teaching.forEach((item, index) => {
        for (const field of REQUIRED_TEACHING_FIELDS) {
          if (!String(item[field] || "").trim()) {
            nextErrors[`teaching.${index}.${field}`] = "This field is required";
          }
        }
      });
    }

    setErrors(nextErrors);

    const total = Object.keys(nextErrors).length;
    if (!total) {
      setShowValidationBanner(false);
      return { valid: true };
    }

    setShowValidationBanner(true);
    const firstPath = Object.keys(nextErrors)[0];
    const firstTab = firstPath.split(".")[0];
    if (firstTab) {
      setActiveTab(firstTab);
    }

    setTimeout(() => {
      const target = document.getElementById(fieldId(firstPath));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 60);

    return { valid: false };
  }

  function applyServerValidationErrors(details) {
    const mapped = {};

    for (const item of details || []) {
      const ref = item.ref || {};
      const tab = ref.tab || "settings";
      const rowIndex = Number.isInteger(ref.index) ? ref.index : 0;
      const errorsList = Array.isArray(item.errors) ? item.errors : [];

      for (const schemaError of errorsList) {
        const path = String(schemaError.instancePath || "");
        const additional = schemaError.params?.additionalProperty;

        if (tab === "publications") {
          if (path === "/date") {
            mapped[`publications.${rowIndex}.year`] = "Use a 4-digit year (e.g. 2024)";
            continue;
          }
          if (path === "/title") {
            mapped[`publications.${rowIndex}.title`] = "This field is required";
            continue;
          }
          if (additional === "authors") {
            mapped[`publications.${rowIndex}.authors`] = "This field format is invalid";
            continue;
          }
          if (additional === "venue") {
            mapped[`publications.${rowIndex}.venue`] = "This field format is invalid";
            continue;
          }
          if (additional === "year") {
            mapped[`publications.${rowIndex}.year`] = "Use a 4-digit year (e.g. 2024)";
            continue;
          }
        }

        if (tab === "profile") {
          mapped["profile.siteName"] = "Please check required profile information";
          continue;
        }

        if (tab === "teaching") {
          mapped[`teaching.${rowIndex}.course`] = "Please review this teaching entry";
        }
      }
    }

    const keys = Object.keys(mapped);
    if (!keys.length) {
      return false;
    }

    setErrors((prev) => ({ ...prev, ...mapped }));
    setShowValidationBanner(true);

    const firstPath = keys[0];
    const firstTab = firstPath.split(".")[0];
    if (firstTab) setActiveTab(firstTab);

    setTimeout(() => {
      const target = document.getElementById(fieldId(firstPath));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 60);

    return true;
  }

  async function onGenerate(event) {
    event.preventDefault();
    const validation = validateForm();
    if (!validation.valid) {
      setStatus("");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const handled = applyServerValidationErrors(error.details);
        if (handled) {
          setStatus("Please fix the highlighted fields before generating.");
          return;
        }
        throw new Error(error.error || "Generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ssgkit-site.zip";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      setStatus("Site generated and downloaded successfully.");
      setToastWithTimeout("Site generated and downloaded successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to generate site.");
    } finally {
      setLoading(false);
    }
  }

  const tabErrorCounts = {
    profile: 0,
    publications: 0,
    projects: 0,
    teaching: 0,
    cv: 0,
    settings: 0
  };

  Object.keys(errors).forEach((path) => {
    const tabId = path.split(".")[0];
    if (Object.prototype.hasOwnProperty.call(tabErrorCounts, tabId)) {
      tabErrorCounts[tabId] += 1;
    }
  });

  const totalErrors = Object.keys(errors).length;
  const summaryParts = tabs
    .filter((tab) => tabErrorCounts[tab.id] > 0)
    .map((tab) => ({ id: tab.id, label: tab.label, count: tabErrorCounts[tab.id] }));

  return (
    <div className="workspace">
      <aside className="sidebar">
        <h1>SSGKit Editor</h1>
        <p className="sidebar-note">Template based static generator for fast portfolio sites.</p>
        <nav className="tab-list" aria-label="Editor tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={tab.id === activeTab ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tabErrorCounts[tab.id] > 0 ? <span className="tab-dot">●</span> : null}
            </button>
          ))}
        </nav>
      </aside>

      <form onSubmit={onGenerate} className="editor">
        <header className="editor-head">
          <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
          <div className="head-actions">
            <button type="button" className="demo-btn" onClick={loadDemo}>Load Demo</button>
            <button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate ZIP"}
            </button>
          </div>
        </header>

        {showValidationBanner && totalErrors > 0 ? (
          <div className="error-banner" role="alert">
            <span>⚠ Please fix {totalErrors} errors before generating:</span>
            <span className="error-links">
              {summaryParts.map((part, index) => (
                <span key={part.id}>
                  <button type="button" className="error-link" onClick={() => setActiveTab(part.id)}>
                    {part.count} in {part.label}
                  </button>
                  {index < summaryParts.length - 1 ? <span>, </span> : null}
                </span>
              ))}
            </span>
          </div>
        ) : null}

        {activeTab === "profile" ? (
          <section className="panel">
            <p className="required-legend">* Required fields</p>
            <div className="field-grid two-col">
              <div className={markField("profile.siteName")} id={fieldId("profile.siteName")}>
                <label>Name <span className="required">*</span></label>
                <input value={form.siteName} onChange={(e) => updateField("siteName", e.target.value)} />
                {errors["profile.siteName"] ? <p className="field-error">{errors["profile.siteName"]}</p> : null}
              </div>
              <div className={markField("profile.role")} id={fieldId("profile.role")}>
                <label>Role <span className="required">*</span></label>
                <input value={form.role} onChange={(e) => updateField("role", e.target.value)} />
                {errors["profile.role"] ? <p className="field-error">{errors["profile.role"]}</p> : null}
              </div>

              <div className="photo-group span-2">
                <label>Profile Photo</label>
                <div className="photo-controls">
                  <input
                    placeholder="https://example.com/photo.jpg"
                    value={form.profileImageUrl}
                    onChange={(e) => {
                      updateField("profileImageUrl", e.target.value);
                      updateField("profileImageUpload", "");
                    }}
                  />
                  <div className="or-divider">OR</div>
                  <input type="file" accept="image/*" onChange={handlePhotoFileChange} />
                </div>
                <img className="photo-preview" src={getPhotoPreview()} alt="Profile preview" />
              </div>

              <div className={markField("profile.institution")} id={fieldId("profile.institution")}>
                <label>Institution <span className="required">*</span></label>
                <input value={form.institution} onChange={(e) => updateField("institution", e.target.value)} />
                {errors["profile.institution"] ? <p className="field-error">{errors["profile.institution"]}</p> : null}
              </div>
              <div className={markField("profile.department")} id={fieldId("profile.department")}>
                <label>Department <span className="required">*</span></label>
                <input value={form.department} onChange={(e) => updateField("department", e.target.value)} />
                {errors["profile.department"] ? <p className="field-error">{errors["profile.department"]}</p> : null}
              </div>
              <div className="field">
                <label>Office</label>
                <input value={form.office} onChange={(e) => updateField("office", e.target.value)} />
              </div>
              <div className={markField("profile.email")} id={fieldId("profile.email")}>
                <label>Email <span className="required">*</span></label>
                <input value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                {errors["profile.email"] ? <p className="field-error">{errors["profile.email"]}</p> : null}
              </div>
              <div className="field">
                <label>Location</label>
                <input value={form.location} onChange={(e) => updateField("location", e.target.value)} />
              </div>
              <div className="field span-2">
                <label>Profile Summary</label>
                <input value={form.tagline} onChange={(e) => updateField("tagline", e.target.value)} />
                <p className="helper-text">Shown under Research Interests. Keep it concise and specific.</p>
              </div>
              <div className="field span-2">
                <label>Homepage Intro</label>
                <textarea value={form.homeIntro} onChange={(e) => updateField("homeIntro", e.target.value)} />
              </div>
              <div className="field span-2">
                <label>Short Bio</label>
                <textarea value={form.shortBio} onChange={(e) => updateField("shortBio", e.target.value)} />
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "publications" ? (
          <section className="panel">
            <p className="required-legend">* Required fields</p>
            {form.publications.map((item, index) => (
              <div className="record" key={index}>
                <div className="record-head">
                  <strong>Publication {index + 1}</strong>
                  <button type="button" className="secondary" onClick={() => removePublication(index)}>Remove</button>
                </div>
                <div className="field-grid two-col">
                  <div className={markField(`publications.${index}.title`)} id={fieldId(`publications.${index}.title`)}>
                    <label>Title <span className="required">*</span></label>
                    <input value={item.title} onChange={(e) => updatePublication(index, "title", e.target.value)} />
                    {errors[`publications.${index}.title`] ? <p className="field-error">{errors[`publications.${index}.title`]}</p> : null}
                  </div>
                  <div className={markField(`publications.${index}.authors`)} id={fieldId(`publications.${index}.authors`)}>
                    <label>Authors <span className="required">*</span></label>
                    <input value={item.authors} onChange={(e) => updatePublication(index, "authors", e.target.value)} />
                    {errors[`publications.${index}.authors`] ? <p className="field-error">{errors[`publications.${index}.authors`]}</p> : null}
                  </div>
                  <div className={markField(`publications.${index}.venue`)} id={fieldId(`publications.${index}.venue`)}>
                    <label>Venue <span className="required">*</span></label>
                    <input value={item.venue} onChange={(e) => updatePublication(index, "venue", e.target.value)} />
                    {errors[`publications.${index}.venue`] ? <p className="field-error">{errors[`publications.${index}.venue`]}</p> : null}
                  </div>
                  <div className={markField(`publications.${index}.year`)} id={fieldId(`publications.${index}.year`)}>
                    <label>Year <span className="required">*</span></label>
                    <input value={item.year} onChange={(e) => updatePublication(index, "year", e.target.value)} />
                    {errors[`publications.${index}.year`] ? <p className="field-error">{errors[`publications.${index}.year`]}</p> : null}
                  </div>
                  <div className="field span-2">
                    <label>Links (comma-separated)</label>
                    <input value={item.links} onChange={(e) => updatePublication(index, "links", e.target.value)} />
                  </div>
                  <div className="field span-2">
                    <label>Summary</label>
                    <input value={item.summary} onChange={(e) => updatePublication(index, "summary", e.target.value)} />
                  </div>
                  <div className="field span-2">
                    <label>Detail Content (Markdown)</label>
                    <textarea value={item.content} onChange={(e) => updatePublication(index, "content", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="secondary" onClick={addPublication}>Add Publication</button>
          </section>
        ) : null}

        {activeTab === "teaching" ? (
          <section className="panel">
            <p className="required-legend">* Required fields</p>
            {form.teaching.map((item, index) => (
              <div className="record" key={index}>
                <div className="record-head">
                  <strong>Course {index + 1}</strong>
                  <button type="button" className="secondary" onClick={() => removeTeaching(index)}>Remove</button>
                </div>
                <div className="field-grid two-col">
                  <div className={markField(`teaching.${index}.course`)} id={fieldId(`teaching.${index}.course`)}>
                    <label>Course Name <span className="required">*</span></label>
                    <input value={item.course} onChange={(e) => updateTeaching(index, "course", e.target.value)} />
                    {errors[`teaching.${index}.course`] ? <p className="field-error">{errors[`teaching.${index}.course`]}</p> : null}
                  </div>
                  <div className={markField(`teaching.${index}.semester`)} id={fieldId(`teaching.${index}.semester`)}>
                    <label>Semester <span className="required">*</span></label>
                    <input value={item.semester} onChange={(e) => updateTeaching(index, "semester", e.target.value)} />
                    {errors[`teaching.${index}.semester`] ? <p className="field-error">{errors[`teaching.${index}.semester`]}</p> : null}
                  </div>
                  <div className="field span-2">
                    <label>Notes</label>
                    <textarea value={item.notes} onChange={(e) => updateTeaching(index, "notes", e.target.value)} />
                  </div>
                  <div className="field span-2">
                    <label>Course Materials Link (Drive/PPT URL)</label>
                    <input
                      value={item.materialsUrl || ""}
                      onChange={(e) => updateTeaching(index, "materialsUrl", e.target.value)}
                      placeholder="https://drive.google.com/... or https://.../slides"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="secondary" onClick={addTeaching}>Add Course</button>
          </section>
        ) : null}

        {activeTab === "projects" ? (
          <section className="panel">
            <p className="required-legend">* Optional but recommended</p>
            {form.projects.map((item, index) => (
              <div className="record" key={index}>
                <div className="record-head">
                  <strong>Project {index + 1}</strong>
                  <button type="button" className="secondary" onClick={() => removeProject(index)}>Remove</button>
                </div>
                <div className="field-grid two-col">
                  <div className="field">
                    <label>Project Title</label>
                    <input value={item.title} onChange={(e) => updateProject(index, "title", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Timeline / Period</label>
                    <input value={item.period} onChange={(e) => updateProject(index, "period", e.target.value)} />
                  </div>
                  <div className="field span-2">
                    <label>Summary</label>
                    <textarea value={item.summary} onChange={(e) => updateProject(index, "summary", e.target.value)} />
                  </div>
                  <div className="field span-2">
                    <label>Project Link</label>
                    <input
                      value={item.link}
                      onChange={(e) => updateProject(index, "link", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="secondary" onClick={addProject}>Add Project</button>
          </section>
        ) : null}

        {activeTab === "cv" ? (
          <section className="panel">
            <p className="required-legend">* Required fields</p>
            <div className="field-grid two-col">
              <div className="field"><label>Google Scholar URL</label><input value={form.scholarUrl} onChange={(e) => updateField("scholarUrl", e.target.value)} /></div>
              <div className="field"><label>GitHub URL</label><input value={form.githubUrl} onChange={(e) => updateField("githubUrl", e.target.value)} /></div>
              <div className="field"><label>LinkedIn URL</label><input value={form.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} /></div>
              <div className="field"><label>CV URL</label><input value={form.cvUrl} onChange={(e) => updateField("cvUrl", e.target.value)} /></div>
              <div className="field span-2"><label>Twitter URL</label><input value={form.twitterUrl || ""} onChange={(e) => updateField("twitterUrl", e.target.value)} /></div>
              <div className="field span-2"><label>Extended About Text</label><textarea value={form.longBio} onChange={(e) => updateField("longBio", e.target.value)} /></div>
            </div>
          </section>
        ) : null}

        {activeTab === "settings" ? (
          <section className="panel">
            <p className="required-legend">* Required fields</p>
            <div className="field-grid two-col">
              <div className="field"><label>Include About</label><select value={String(form.includeAbout)} onChange={(e) => updateField("includeAbout", e.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></select></div>
              <div className="field"><label>Include Publications</label><select value={String(form.includePublications)} onChange={(e) => updateField("includePublications", e.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></select></div>
              <div className="field"><label>Include Projects</label><select value={String(form.includeProjects)} onChange={(e) => updateField("includeProjects", e.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></select></div>
              <div className="field"><label>Include Teaching</label><select value={String(form.includeTeaching)} onChange={(e) => updateField("includeTeaching", e.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></select></div>
              <div className="field"><label>Primary Color</label><input type="color" value={form.primaryColor} onChange={(e) => updateField("primaryColor", e.target.value)} /></div>
              <div className="field"><label>Accent Color</label><input type="color" value={form.accentColor} onChange={(e) => updateField("accentColor", e.target.value)} /></div>
            </div>
          </section>
        ) : null}

        {status ? <p className="status">{status}</p> : null}
      </form>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
