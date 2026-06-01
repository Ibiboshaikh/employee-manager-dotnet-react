import { useThemeStore } from "../stores/themeStore";
const DarkModeToggle = () => {
    const mode = useThemeStore(s => s.mode);
    const toggle = useThemeStore(s => s.toggle);

    return (
        <button type="button" onClick={toggle} className="btn-secondary" >
            {mode === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
    );
}

export default DarkModeToggle;