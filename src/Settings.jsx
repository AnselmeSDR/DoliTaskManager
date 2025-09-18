import React from 'react';
import Switch from "./components/Switch.jsx";
import Input from "./components/Input.jsx";
import Select from "./components/Select.jsx";

const Settings = ({
                      apiKey,
                      setApiKey,
                      apiUrl,
                      setApiUrl,
                      showOnlyMyTasks,
                      setShowOnlyMyTasks,
                      defaultDuration,
                      setDefaultDuration,
                      showClosedTasks,
                      setShowClosedTasks,
                      useEmojiIcons,
                      setUseEmojiIcons,
                      initialLimitTasks,
                      setInitialLimitTasks,
                      limitTasks,
                      setLimitTasks,
                      limitTimes,
                      setLimitTimes,
                      showTimes,
                      setShowTimes,
                  }) => {
    return (
        <div className="h-[560px] overflow-hidden bg-blue-50 flex flex-col w-full">
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 px-2 py-4">

                <h2 className="text-lg font-semibold w-full">API</h2>
                <Input
                    label={"URL de l'API"}
                    name="apiUrl"
                    placeholder="http://localhost"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                />

                <Input
                    label={"Clé de l'API"}
                    name="apiKey"
                    placeholder="1337"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />

                <h2 className="text-lg font-semibold w-full mt-4">Liste des tâches</h2>
                <Switch
                    id="showOnlyMyTasks"
                    checked={showOnlyMyTasks}
                    onChange={(val) => setShowOnlyMyTasks(val)}
                    label="Voir seulement mes tickets"
                />
                <Switch
                    id="showClosedTasks"
                    checked={showClosedTasks}
                    onChange={(val) => setShowClosedTasks(val)}
                    label="Voir aussi les tickets terminés"
                />
                <Switch
                    id="useEmojiIcons"
                    checked={useEmojiIcons}
                    onChange={(val) => setUseEmojiIcons(val)}
                    label="Utiliser des emojis pour les icônes de tâches"
                />
                <Select
                    label="Nombre maximum de tâches à charger à l'ouverture"
                    name="initialLimitTasks"
                    full={false}
                    value={initialLimitTasks}
                    onChange={(e) => setInitialLimitTasks(parseInt(e.target.value, 10))}
                    options={[5, 10, 15, 20, 25, 50, 100, 200]}
                />
                <Select
                    label="Nombre maximum de tâches à charger"
                    name="limitTasks"
                    full={false}
                    value={limitTasks}
                    onChange={(e) => setLimitTasks(parseInt(e.target.value, 10))}
                    options={[5, 10, 15, 20, 25, 50, 100, 200]}
                />

                <h2 className="text-lg font-semibold w-full mt-4">Tâche</h2>
                <Select
                    label="Durée par défaut sélectionnée (minutes)"
                    name="defaultDuration"
                    full={false}
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(e.target.value)}
                    options={[5, 10, 15, 20, 30, 60, 120]}
                />
                <Switch
                    id="showTimes"
                    checked={showTimes}
                    onChange={(val) => setShowTimes(val)}
                    label="Afficher l'historique des temps passés"
                />
                <Select
                    label="Nombre maximum d'historiques de temps à charger"
                    name="limitTimes"
                    full={false}
                    value={limitTimes}
                    onChange={(e) => setLimitTimes(parseInt(e.target.value, 10))}
                    options={[1, 5, 10]}
                    disabled={!showTimes}
                />

            </div>
        </div>
    );
};

export default Settings;
