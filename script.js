document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('resume-form');
  const results = document.getElementById('results');
  const resumeOutput = document.getElementById('resume-output');
  const coverLetterOutput = document.getElementById('cover-letter-output');
  const downloadBtn = document.getElementById('download-pdf');

  // Cohere Text Generation with `command-light`
  async function generateTextWithCohere(prompt) {
    const COHERE_API_KEY = "x92isTsMSAYU5hcaKbvxxeTet1cuEvLStz0uRgQ8"; // Replace with your real key

    try {
      const response = await fetch("https://api.cohere.ai/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
          "Cohere-Version": "2022-12-06"
        },
        body: JSON.stringify({
          model: "command-light", // Supported model for generate endpoint
          prompt: prompt,
          max_tokens: 150,
          temperature: 0.7,
          stop_sequences: ["--"]
        })
      });

      const result = await response.json();
      console.log("Cohere API response:", result);

      if (!result.generations || !result.generations[0]) {
        return " Cohere returned no text. Check your key or try a different prompt.";
      }

      return result.generations[0].text.trim();
    } catch (error) {
      console.error("Cohere fetch error:", error);
      return " Request failed: " + error.message;
    }
  }

  // PDF Download with jsPDF
  downloadBtn.addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add Resume heading
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUME', pageWidth / 2, margin, { align: 'center' });
   
    // Add a line under the heading
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 5, pageWidth - margin, margin + 5);
   
    // Add resume content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const resumeText = resumeOutput.textContent;
    const resumeLines = doc.splitTextToSize(resumeText, pageWidth - 2 * margin);
    doc.text(resumeLines, margin, margin + 20);

    // Add new page for Cover Letter
    doc.addPage();
   
    // Add Cover Letter heading
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('COVER LETTER', pageWidth / 2, margin, { align: 'center' });
   
    // Add a line under the heading
    doc.line(margin, margin + 5, pageWidth - margin, margin + 5);
   
    // Add cover letter content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const letterText = coverLetterOutput.textContent;
    const letterLines = doc.splitTextToSize(letterText, pageWidth - 2 * margin);
    doc.text(letterLines, margin, margin + 20);

    doc.save('resume_and_cover_letter.pdf');
  });

  // Handle Form Submission
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const linkedin = document.getElementById('linkedin').value;
    const location = document.getElementById('location').value;
    const education = document.getElementById('education').value;
    const work = document.getElementById('work').value;
    const skills = document.getElementById('skills').value;
    const certifications = document.getElementById('certifications').value;
    const jobRole = document.getElementById('job-role').value;
    const company = document.getElementById('company').value;

    let resume = `${name}\n`;
    if (email) resume += `${email}\n`;
    if (phone) resume += `${phone}\n`;
    if (linkedin) resume += `${linkedin}\n`;
    if (location) resume += `${location}\n\n`;
    resume += `EDUCATION\n${education}\n\n`;
    resume += `WORK EXPERIENCE\n${work}\n\n`;
    resume += `SKILLS\n${skills}\n\n`;
    if (certifications) resume += `CERTIFICATIONS/PROJECTS\n${certifications}\n`;

    let coverLetter = `${name}\n${location}\n\n${new Date().toLocaleDateString()}\n\n` +
`Hiring Manager\n${company}\n\n` +
`Dear Hiring Manager,\n\n` +
`I am excited to apply for the ${jobRole} position at ${company}. With a background in ${work.split(',')[0] || 'software development'} and strong skills in ${skills.split(',')[0] || 'key technologies'}, I am confident in my ability to contribute to your innovative team.\n\n` +
`During my previous roles, I have developed expertise in ${skills}. My experience includes ${work}. I am eager to bring my technical abilities and passion for innovation to ${company}, and I am inspired by your commitment to excellence.\n\n` +
`Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience can benefit your team.\n\n` +
`Sincerely,\n${name}`;


    // Generate summary using Cohere
    try {
      const prompt = `Write a professional resume summary for ${name}. Experience: ${work}. Skills: ${skills}.`;
      const aiSummary = await generateTextWithCohere(prompt);
      resumeOutput.textContent = `PROFESSIONAL SUMMARY\n${aiSummary}\n\n${resume}`;
    } catch (error) {
      resumeOutput.textContent = resume;
    }

    coverLetterOutput.textContent = coverLetter;
    results.style.display = 'block';
  });

  // Optional: Test the connection
  generateTextWithCohere("Give a 1-line summary of Artificial Intelligence.").then(result => {
    console.log("Cohere Test Output:", result);
  });
});