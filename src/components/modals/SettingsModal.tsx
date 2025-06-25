import { useState, useContext } from "react";

import { _ } from "~/lib/i18n";
import { importGame } from "~/lib/game";
import {
  getSFXEnabled,
  setSFXEnabled,
  getTTSEnabled,
  setTTSEnabled,
  getMode,
  setMode,
  getShowIntro,
  exportBackup,
} from "~/lib/storage";

import MenuPreference from "~/components/MenuPreference";
import MenuButton from "~/components/MenuButton";
import ConfirmModal from "~/components/modals/ConfirmModal";
import { ModalContext } from "~/components/modals/Modal";

interface Props {
  onShowCredits: () => void;
  onImportBackupFailed: () => void;
  [key: string]: any;
}

function MenuItem({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: "1em" }}>{children}</div>;
}

export default function SettingsModal({
  onImportBackupFailed,
  onShowCredits,
  ...props
}: Props) {
  const { setOpen } = useContext(ModalContext);
  const [sfxEnabled, setSFX] = useState(getSFXEnabled());
  const [ttsEnabled, setTTS] = useState(getTTSEnabled());
  const [defaultMode, setModeState] = useState(getMode());

  const toggleSFX = () => {
    setSFX((enabled) => {
      enabled = !enabled;
      setSFXEnabled(enabled);
      return enabled;
    });
  };
  const toggleTTS = () => {
    setTTS((enabled) => {
      enabled = !enabled;
      setTTSEnabled(enabled);
      return enabled;
    });
  };
  const toggleMode = () => {
    setModeState((mode) => {
      mode = !mode;
      setMode(mode);
      return mode;
    });
  };

  const backupLabel = _(getShowIntro() ? "Import Backup" : "Export Backup");
  const onBackup = async () => {
    const ext = ".bak";
    if (getShowIntro()) {
      const [file] = await window.webxdc.importFiles({ extensions: [ext] });
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          if (!importGame(JSON.parse(e.target.result as string))) {
            onImportBackupFailed();
          }
        }
      };
      reader.readAsText(file, "UTF-8");
    } else {
      const backup = await exportBackup();
      window.webxdc.sendToChat({
        file: {
          name: `babel-dungeon.${backup.lang}${ext}`,
          plainText: JSON.stringify(backup),
        },
      });
    }
    setOpen(false);
  };

  const sfxState = _(sfxEnabled ? "[ ON]" : "[OFF]");
  const ttsState = _(ttsEnabled ? "[ ON]" : "[OFF]");
  const modeState = _(defaultMode ? "[EASY]" : "[HARD]");

  return (
    <ConfirmModal {...props}>
      <div>
        <div style={{ marginBottom: "2em" }}>
          {_("SETTINGS")}
          <hr />
        </div>
        <MenuItem>
          <MenuPreference
            name={_("SFX")}
            state={sfxState}
            onClick={toggleSFX}
          />
        </MenuItem>
        <MenuItem>
          <MenuPreference
            name={_("TTS")}
            state={ttsState}
            onClick={toggleTTS}
          />
        </MenuItem>
        <MenuItem>
          <MenuPreference
            name={_("Mode")}
            state={modeState}
            onClick={toggleMode}
          />
        </MenuItem>
        <MenuItem>
          <MenuButton onClick={onBackup}>{backupLabel}</MenuButton>
        </MenuItem>
        <MenuItem>
          <MenuButton onClick={onShowCredits}>{_("Credits")}</MenuButton>
        </MenuItem>
      </div>
    </ConfirmModal>
  );
}
