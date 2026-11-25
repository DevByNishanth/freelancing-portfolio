import { Fragment, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const steps = ["Contact info", "Project details", "About you"];

const initialValues = {
  fullName: "",
  email: "",
  phone: "",
  projectType: "",
  projectDescription: "",
  budgetRange: "",
  timeline: "",
  clientType: "",
  companyName: "",
  role: "",
  referralSource: "",
};

const selectOptions = {
  projectType: [
    "Website Development",
    "Web Application",
    "Mobile Application",
    "UI/UX Design",
    "E-commerce Website",
    "Other",
  ],
  budgetRange: ["Under 10,000", "10,000–20,000", "20,000–50,000", "50,000+", "Not sure yet"],
  timeline: ["As soon as possible", "Within 1 month", "1–3 months", "3–6 months", "Flexible"],
  role: ["Founder / Owner", "Business Manager", "Developer", "Marketing Team", "Other"],
  referralSource: ["Google Search", "Social Media", "Referral", "Other"],
};

const inputClass =
  "mt-2 w-full rounded-sm border border-white/10 bg-white/[0.055] px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/15";

function Field({ label, name, value, onChange, required, type = "text", placeholder }) {
  return (
    <label className="block text-sm font-medium text-white/80" htmlFor={name}>
      {label}{required && <span className="ml-1 text-emerald-300">*</span>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={name === "fullName" ? "name" : name === "email" ? "email" : name === "phone" ? "tel" : undefined}
        className={inputClass}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options, required }) {
  return (
    <label className="block text-sm font-medium text-white/80" htmlFor={name}>
      {label}{required && <span className="ml-1 text-emerald-300">*</span>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 w-full rounded-sm border border-white/10 bg-[#101b16] px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/15"
      >
        <option value="" disabled>Select an option</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Stepper({ current }) {
  return (
    <ol className="mt-3 flex items-center pb-6" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((title, index) => {
        const isActive = index === current;
        const isDone = index < current;

        return (
          <Fragment key={title}>
            {index > 0 && (
              <li aria-hidden="true" className="relative mx-1 h-px flex-1 bg-white/15">
                <motion.span
                  className="absolute inset-y-0 left-0 bg-emerald-300"
                  initial={false}
                  animate={{ width: index <= current ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </li>
            )}

            <li
              className="relative flex shrink-0 items-center justify-center"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${isActive
                    ? "bg-white text-[#0a1510] ring-4 ring-white/10"
                    : isDone
                      ? "bg-emerald-300 text-[#0a1510]"
                      : "border border-white/20 bg-[#16211c]"
                  }`}
              >
                {isActive && index + 1}
                {isDone && "✓"}
                {!isActive && !isDone && <span className="h-1.5 w-1.5 rounded-full bg-white/70" />}
              </span>

              <span
                className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.15em] transition-colors ${isActive ? "text-white/80" : "text-white/35"
                  }`}
              >
                Step {index + 1}
                <span className="sr-only"> — {title}</span>
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

export default function ProjectForm({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const updateValue = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const close = () => {
    onClose();
    setStep(0);
    setValues(initialValues);
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-md sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
          role="presentation"
        >
          <motion.section
            role="dialog" aria-modal="true" aria-labelledby="project-form-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative my-auto w-[80%] overflow-hidden rounded-sm border border-white/15 bg-[#0a1510]/90 text-white shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-[90px]" />
            <div className="relative border-b border-white/10 px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
              <button type="button" onClick={close} aria-label="Close project form" className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-xl text-white/60 transition hover:bg-white/10 hover:text-white">×</button>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Start a project</p>
              <h2 id="project-form-title" className="mt-2 pr-10 text-2xl font-semibold tracking-tight sm:text-xl">{submitted ? "Thanks for reaching out." : "Let’s build something meaningful."}</h2>
              <p className="max-w-lg text-sm leading-relaxed text-white/55">{submitted ? "Your project details are ready. We’ll be in touch soon." : "Share a few details and we’ll get back to you to talk through the next steps."}</p>

              {!submitted && <Stepper current={step} />}
            </div>

            {submitted ? (
              <div className="relative flex flex-col items-center px-6 py-12 text-center sm:py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-2xl text-emerald-300">✓</div>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">Thank you, {values.fullName}. We appreciate you telling us about your {values.projectType.toLowerCase()} project.</p>
                <button type="button" onClick={close} className="mt-7 rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-[#07100c] transition hover:bg-emerald-200">Close</button>
              </div>
            ) : (
              <form key={step} onSubmit={handleSubmit} className="relative">
                <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-8 sm:py-7">
                  {step === 0 && <>
                    <Field label="Full Name" name="fullName" value={values.fullName} onChange={updateValue} required placeholder="Your name" />
                    <Field label="Email Address" name="email" type="email" value={values.email} onChange={updateValue} required placeholder="you@example.com" />
                    <div className="sm:col-span-2"><Field label="Phone / WhatsApp" name="phone" type="tel" value={values.phone} onChange={updateValue} placeholder="Include your country code" /></div>
                  </>}
                  {step === 1 && <>
                    <SelectField label="Project Type" name="projectType" value={values.projectType} onChange={updateValue} options={selectOptions.projectType} required />
                    <SelectField label="Budget Range" name="budgetRange" value={values.budgetRange} onChange={updateValue} options={selectOptions.budgetRange} />
                    <div className="sm:col-span-2">
                      <label htmlFor="projectDescription" className="block text-sm font-medium text-white/80">Project Description<span className="ml-1 text-emerald-300">*</span></label>
                      <textarea id="projectDescription" name="projectDescription" value={values.projectDescription} onChange={updateValue} required rows={4} placeholder="What would you like to build?" className={`${inputClass} min-h-[80px] max-h-[40px] `} />
                    </div>
                    <SelectField label="Expected Timeline" name="timeline" value={values.timeline} onChange={updateValue} options={selectOptions.timeline} />
                  </>}
                  {step === 2 && <>
                    <fieldset className="sm:col-span-2">
                      <legend className="text-sm font-medium text-white/80">Are you an individual or a business?<span className="ml-1 text-emerald-300">*</span></legend>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {["Individual", "Startup", "Small Business", "Established Company"].map((option) => <label key={option} className={`cursor-pointer rounded-sm border px-3 py-3 text-center text-xs transition sm:text-sm ${values.clientType === option ? "border-emerald-300/70 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/[0.035] text-white/65 hover:border-white/25"}`}><input className="sr-only" type="radio" name="clientType" value={option} checked={values.clientType === option} onChange={updateValue} required />{option}</label>)}
                      </div>
                    </fieldset>
                    <Field label="Company / Brand Name" name="companyName" value={values.companyName} onChange={updateValue} placeholder="Your company (optional)" />
                    <SelectField label="Your Role" name="role" value={values.role} onChange={updateValue} options={selectOptions.role} />
                    <div className="sm:col-span-2"><SelectField label="How did you find us?" name="referralSource" value={values.referralSource} onChange={updateValue} options={selectOptions.referralSource} /></div>
                  </>}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 sm:px-8">
                  {step > 0 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="rounded-full px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white">← Back</button> : <span className="text-xs text-white/35"><span className="text-emerald-300">*</span> Required fields</span>}
                  <button type="submit" className="rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-[#07100c] transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1510]">{step === steps.length - 1 ? "Send project details" : "Continue"}<span className="ml-2" aria-hidden="true">→</span></button>
                </div>
              </form>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
