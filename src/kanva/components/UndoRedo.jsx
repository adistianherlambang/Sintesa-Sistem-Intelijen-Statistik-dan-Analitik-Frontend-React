import { LuUndo, LuRedo } from 'react-icons/lu';
import styles from './UndoRedo.module.css';

export default function UndoRedo({ undo, redo, canUndo, canRedo }) {
    return (
        <div className={styles.group}>
            <button
                className={styles.btn}
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
            >
                <LuUndo size={16} />
            </button>
            <button
                className={styles.btn}
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            >
                <LuRedo size={16} />
            </button>
        </div>
    );
}
