import { useForm } from "react-hook-form";

interface TestFormData {
    testField: string;
}

const TestForm = () => {
    const { register, handleSubmit } = useForm<TestFormData>();

    const onValidSubmit = (data: TestFormData) => {
        console.log("🚀 Form Data Successfully Submitted via RHF:", data);
    };
return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={styles.title}>React Hook Form Test Sandbox</h3>
        
        {/* ── 3. WIRE THE SUBMIT RUNTIME ── */}
        {/* handleSubmit prevents the default browser reload automatically */}
        <form onSubmit={handleSubmit(onValidSubmit)}>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Test Field Inputs</label>
            
            {/* ── 4. SPREAD REGISTRATION OBJECT ── */}
            {/* Rule: NO value= or onChange=. The register function returns all */}
            {/* underlying refs and inputs listeners required by RHF internally. */}
            <input
              type="text"
              placeholder="Type anything here..."
              style={styles.input}
              {...register("testField")} 
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Test Submit
          </button>
        </form>

      </div>
    </div>
  );
};

// ── MINIMAL CLEAN OVERLAY VISUAL STYLES ────────────────────────────────────
const styles = {
  container: { display: "flex", justifyContent: "center", padding: "40px 20px" },
  card: { backgroundColor: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 18px 40px -20px rgba(11,31,58,0.28)", border: "1px solid #e4e8ee", width: "100%", maxWidth: "400px" },
  title: { margin: "0 0 20px 0", fontFamily: "'Poppins', sans-serif", color: "#0b1f3a", fontSize: "16px" },
  formGroup: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#444" },
  input: { width: "100%", padding: "11px 14px", border: "1px solid #e4e8ee", borderRadius: "10px", boxSizing: "border-box" as const },
  submitBtn: { width: "100%", padding: "12px", backgroundColor: "#2a93a8", color: "white", border: "none", borderRadius: "999px", fontWeight: "600", cursor: "pointer" }
};

export default TestForm;