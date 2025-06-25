import { useState, useCallback } from "react";
import PixelPlaySolid from "~icons/pixel/play-solid";
import PixelCrownSolid from "~icons/pixel/crown-solid";
import PixelFireSolid from "~icons/pixel/fire-solid";

import {
  MAIN_COLOR,
  GOLDEN,
  RED,
  MAX_LEVEL,
  PLAY_ENERGY_COST,
} from "~/lib/constants";
import { _ } from "~/lib/i18n";
import { getLastPlayed, getShowIntro } from "~/lib/storage";
import { startNewGame } from "~/lib/game";

import { ModalContext } from "~/components/modals/Modal";
import NoEnergyModal from "~/components/modals/NoEnergyModal";
import IntroModal from "~/components/modals/IntroModal";
import PixelatedProgressBar from "~/components/PixelatedProgressBar";
import StatSection from "~/components/StatSection";
import TitleBar from "~/components/TitleBar";
import MenuButton from "~/components/MenuButton";

const card = {
  display: "flex",
  flexDirection: "column" as "column",
  border: "1px solid #464646",
  borderRadius: "5px",
  padding: "10px",
};

interface Props {
  player: Player;
}

export default function Home({ player }: Props) {
  const [modal, setModal] = useState(
    (getShowIntro() ? "intro" : null) as "intro" | "noEnergy" | null,
  );
  const today = new Date().setHours(0, 0, 0, 0);
  const lastPlayed = getLastPlayed();
  const epicStreak = player.streak >= 7;
  const streakColor =
    lastPlayed === today ? (epicStreak ? GOLDEN : MAIN_COLOR) : "#a8a8a8";
  const streakSize = player.streak > 99 ? "0.9em" : undefined;
  const toReviewColor = player.toReview ? undefined : MAIN_COLOR;
  const energyColor = player.energy < 10 ? RED : undefined;

  const missingXp = player.totalXp - player.xp;
  const xp = player.lvl === MAX_LEVEL ? _("MAX") : missingXp;
  const xpColor = player.lvl === MAX_LEVEL ? MAIN_COLOR : undefined;
  const xpSize =
    missingXp > 999999 ? "0.8em" : missingXp > 99999 ? "0.9em" : undefined;
  const xpUnit = player.lvl === MAX_LEVEL ? undefined : _("xp");

  const maxSeenRank = player.seen === player.total;
  const seenProgress = maxSeenRank ? 100 : player.seen % 100;
  const seenRankColor = maxSeenRank ? MAIN_COLOR : undefined;
  const maxMasteredRank = player.mastered === player.total;
  const masteredProgress = maxMasteredRank ? 100 : player.mastered % 100;
  const masteredRankColor = maxMasteredRank ? MAIN_COLOR : undefined;

  const onPlay = useCallback(() => {
    if (player.energy >= PLAY_ENERGY_COST) {
      startNewGame();
    } else {
      setModal("noEnergy");
    }
  }, [player]);
  const setOpen = useCallback(
    (show: boolean) => (show ? setModal(modal) : setModal(null)),
    [],
  );

  return (
    <>
      <ModalContext.Provider value={{ isOpen: !!modal, setOpen }}>
        {modal === "intro" ? <IntroModal /> : <NoEnergyModal />}
      </ModalContext.Provider>
      <TitleBar />
      <div style={{ padding: "0.5em" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            paddingBottom: "1em",
          }}
        >
          <div style={{ ...card, width: "50%", marginRight: "0.2em" }}>
            <StatSection
              title={_("LEVEL")}
              number={player.lvl}
              style={{ paddingBottom: "1em" }}
            />
            <StatSection
              title={_("NEXT")}
              number={xp}
              numberSize={xpSize}
              numberColor={xpColor}
              unit={xpUnit}
              style={{ paddingBottom: "1em" }}
            />
            <StatSection
              title={_("ENERGY")}
              number={player.energy}
              numberColor={energyColor}
              unit={`/${player.maxEnergy}`}
            />
          </div>
          <div style={{ ...card, width: "50%" }}>
            <StatSection
              title={_("STREAK")}
              number={player.streak}
              numberSize={streakSize}
              numberColor={streakColor}
              unit={_(player.streak === 1 ? "day" : "days")}
              style={{ paddingBottom: "1em" }}
              icon={<PixelFireSolid style={{ color: streakColor }} />}
            />
            <StatSection
              title={_("PLAYED")}
              number={player.studiedToday}
              unit={_("today")}
              style={{ paddingBottom: "1em" }}
            />
            <StatSection
              title={_("REVIEW")}
              number={player.toReview}
              numberColor={toReviewColor}
            />
          </div>
        </div>
        <div style={card}>
          <div style={{ paddingTop: "0.5em", paddingBottom: "1em" }}>
            <div style={{ paddingBottom: "0.3em" }}>{_("Discovered:")}</div>
            <div style={{ paddingBottom: "0.3em" }}>
              {seenProgress}/100
              <span style={{ display: "inline", float: "right" }}>
                <PixelCrownSolid
                  style={{ color: MAIN_COLOR, marginRight: "0.2em" }}
                />
                <span style={{ color: seenRankColor }}>
                  {Math.floor(player.seen / 100)}
                </span>
              </span>
            </div>
            <PixelatedProgressBar
              progress={seenProgress}
              total={100}
              color={MAIN_COLOR}
            />
          </div>
          <div style={{ paddingBottom: "0.5em" }}>
            <div style={{ paddingBottom: "0.2em" }}>{_("Mastered:")}</div>
            <div style={{ paddingBottom: "0.3em" }}>
              {masteredProgress}/100
              <span style={{ display: "inline", float: "right" }}>
                <PixelCrownSolid
                  style={{ color: GOLDEN, marginRight: "0.2em" }}
                />
                <span style={{ color: masteredRankColor }}>
                  {Math.floor(player.mastered / 100)}
                </span>
              </span>
            </div>
            <PixelatedProgressBar
              progress={masteredProgress}
              total={100}
              color={GOLDEN}
            />
          </div>
        </div>
        <MenuButton
          style={{
            fontSize: "1.5em",
            color: "black",
            background: MAIN_COLOR,
            padding: "0.6em 0.5em",
            marginTop: "1em",
          }}
          onClick={onPlay}
        >
          <PixelPlaySolid />
        </MenuButton>
      </div>
    </>
  );
}
