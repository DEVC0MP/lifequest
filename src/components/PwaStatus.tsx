import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaStatus(props: { hasStorageFailure: boolean; onOpenData: () => void }) {
  const [online, setOnline] = useState(() => navigator.onLine);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!needRefresh && !offlineReady && online) return null;

  const updateBlocked = !online || props.hasStorageFailure;
  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  let title = "Pracujesz offline";
  let description = "Zmiany nadal zapisują się lokalnie na tym urządzeniu.";

  if (needRefresh) {
    title = "Dostępna jest aktualizacja LifeQuest";
    description = !online
      ? "Połącz się z internetem, aby bezpiecznie pobrać nową wersję."
      : props.hasStorageFailure
        ? "Najpierw rozwiąż problem z lokalnym zapisem w sekcji Dane."
        : "Odświeżenie wczyta nową wersję. Twoje lokalne dane pozostaną na urządzeniu.";
  } else if (offlineReady) {
    title = "LifeQuest jest gotowy do pracy offline";
    description = "Po pierwszym uruchomieniu możesz korzystać z aplikacji również bez internetu.";
  }

  return (
    <aside className={`pwa-status${needRefresh ? " update" : ""}`} aria-live="polite" aria-atomic="true">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <div className="pwa-status-actions">
        {needRefresh && props.hasStorageFailure ? (
          <button className="secondary-button" type="button" onClick={props.onOpenData}>
            Przejdź do danych
          </button>
        ) : null}
        {needRefresh ? (
          <button
            className="primary-button"
            type="button"
            disabled={updateBlocked}
            onClick={() => void updateServiceWorker(true)}
          >
            Zaktualizuj
          </button>
        ) : null}
        {(needRefresh || offlineReady) ? (
          <button className="secondary-button" type="button" onClick={dismiss}>
            {needRefresh ? "Później" : "Zamknij"}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
