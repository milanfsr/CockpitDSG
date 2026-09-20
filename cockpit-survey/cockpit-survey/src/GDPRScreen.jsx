import { useState } from 'react'
import './GDPRScreen.css'

export default function GDPRScreen({ onAccept }) {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const canProceed = checked1 && checked2

  function handleContinue() {
    setAttempted(true)
    if (canProceed) onAccept()
  }

  return (
    <div className="gdpr-wrap">
      <div className="gdpr-card">
        <h1 className="gdpr-title">Informed Consent of Participation</h1>
        <p className="gdpr-lead">
          You are invited to participate in the online study <strong>Cockpit Preferences</strong>, initiated and
          conducted by Milan Fossurier, Isabel Wanderwitz, Philipp Thalhammer and Thomas Weber.
          The research is supervised by Dr. Thomas Weber at LMU Munich under Prof. Dr. Albrecht Schmidt.
        </p>
        <p className="gdpr-lead">Please note:</p>
        <ul className="gdpr-bullets">
          <li>Your participation is voluntary.</li>
          <li>The online study will last approximately 30 minutes.</li>
          <li>We will record personal demographics (age, gender, flight experience).</li>
          <li>You will receive no compensation.</li>
          <li>We may publish results from this and other sessions.</li>
          <li>All data you provide will be published anonymized and cannot be associated with your identity.</li>
        </ul>
        <p className="gdpr-lead">
          If you have any questions, please contact Dr. Thomas Weber (<a href="mailto:thomas.weber@ifi.lmu.de" className="gdpr-link">thomas.weber@ifi.lmu.de</a>) or Prof. Dr. Albrecht Schmidt.
          You should carefully read the information below. If you do not fully agree, do not give your consent.
        </p>

        <div className="gdpr-body">

          <h2 className="gdpr-section">1. Purpose and Goal</h2>
          <p>The study explores how UI elements can be placed in airplane cockpits. It aims to understand how pilots prefer the placement of groups of different interface elements. Results may be presented at scientific or professional meetings or published in scientific proceedings and journals.</p>

          <h2 className="gdpr-section">2. Participation and Compensation</h2>
          <p>Your participation is voluntary. You will be one of approximately 20 people surveyed. You will receive no compensation. You may withdraw and discontinue participation at any time, and may refuse to answer any questions.</p>
          <p>At any time and without giving any reason, you can notify us that you want to withdraw consent given (GDPR Art. 7(3)). In case of withdrawal, your data will be deleted or anonymized where legally permissible (GDPR Art. 17). Once data is anonymized, deletion is not possible as we will no longer be able to identify which data is yours.</p>

          <h2 className="gdpr-section">3. Procedure</h2>
          <p>After giving consent, you will be guided through:</p>
          <ol className="gdpr-ol">
            <li>Introduction including this informed consent form</li>
            <li>Survey on demographic information</li>
            <li>Rating cockpit UI elements</li>
            <li>Arrange cockpit UI elements</li>
          </ol>
          <p>The complete procedure will last approximately 30 minutes.</p>

          <h2 className="gdpr-section">4. Risks and Benefits</h2>
          <p>There are no risks associated with this online study. Discomforts or inconveniences will be minor. If you feel uncomfortable, you may discontinue. You will not directly benefit from participation, but your input will help advance knowledge in this research field.</p>

          <h2 className="gdpr-section">5. Data Protection and Confidentiality</h2>
          <p>The GDPR governs data collection. The legal basis for processing is participant consent pursuant to Art. 6(1)(a) GDPR. Your rights under GDPR include:</p>
          <ul className="gdpr-bullets">
            <li>Right to access your personal data (Art. 15)</li>
            <li>Right to correct inaccurate data (Art. 16)</li>
            <li>Right to erasure (Art. 17)</li>
            <li>Right to restrict processing (Art. 18)</li>
            <li>Right to data portability (Art. 20)</li>
            <li>Right to object to processing (Art. 21)</li>
          </ul>
          <p>We will record personal data (age, gender, flight experience) during participation. Researchers will not identify you by real name in any reports. Your non-anonymized data will be stored for 6 months from the time consent is given in a secure location accessible only to the research team. Anonymized data may be shared publicly. Despite careful anonymization, we cannot guarantee complete anonymity of your personal data. According to the GDPR, researchers will inform participants if a breach of confidential data is detected.</p>
          <p>This site may use cookies and tracking technologies to conduct the research and improve user experience.</p>

          <h2 className="gdpr-section">6. Identification of Investigators</h2>
          <p>
            Milan Fossurier, Isabel Wanderwitz, Philipp Thalhammer<br />
            Thomas Weber (<a href="mailto:thomas.weber@ifi.lmu.de" className="gdpr-link">thomas.weber@ifi.lmu.de</a>)
          </p>
          <p><strong>Principal Investigator:</strong> Dr. Thomas Weber, Frauenlobstr 7a, 80337 Munich</p>
          <p><strong>Department Head:</strong> Prof. Dr. Albrecht Schmidt, Frauenlobstr 7a, 80337 Munich</p>

        </div>

        <div className="gdpr-consent">
          <h2 className="gdpr-section" style={{marginBottom:'1rem'}}>7. Informed Consent and Agreement</h2>
          <p style={{fontSize:13,color:'#555',marginBottom:'1rem'}}>This consent form will be retained securely and in compliance with the GDPR for no longer than necessary.</p>

          <label className="gdpr-consent-label">
            <input type="checkbox" checked={checked1} onChange={e => setChecked1(e.target.checked)} className="gdpr-checkbox" />
            <span>
              I understand the explanation provided to me. I was able to save a copy of this form. I reached out to the listed researchers and have had all my questions answered to my satisfaction. Therefore, I voluntarily agree to participate in this online study.
            </span>
          </label>

          <label className="gdpr-consent-label" style={{marginTop:'12px'}}>
            <input type="checkbox" checked={checked2} onChange={e => setChecked2(e.target.checked)} className="gdpr-checkbox" />
            <span>
              I voluntarily consent to my data being recorded and subsequently processed in line with the GDPR. I have been informed about the consequences of withdrawing my consent.
            </span>
          </label>

          {attempted && !canProceed && (
            <p className="gdpr-error">Please check both boxes above to continue.</p>
          )}
        </div>

        <button className="gdpr-btn" type="button" onClick={handleContinue}>
          Begin survey →
        </button>
      </div>
    </div>
  )
}
