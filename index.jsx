import React, { useState, useEffect, useRef, useCallback } from 'react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

// Recharts imports for graph visualization
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Translation data
const translations = {
  en: {
    appTitle: "CentONE AI V4",
    loggedInAs: "Logged in as:",
    loginRegister: "Login / Register",
    chatHistory: "Chat History",
    prompts: "Prompts",
    addNewPrompt: "Add new custom prompt",
    addCustomPrompt: "Add Custom Prompt",
    myPrompts: "My Prompts:",
    aiPerformance: "AI Performance",
    latency: "Latency:",
    tokenUsage: "Token Usage:",
    modelVersion: "Model Version:",
    chatTitle: "CentONE AI V4 Chat",
    temperature: "Temp:",
    tone: "Tone:",
    regenerate: "Regenerate",
    stop: "Stop",
    typeMessage: "Type your message...",
    toolsNavigation: "Tools & Navigation",
    home: "Home (Placeholder)",
    settings: "Settings",
    documentChat: "Document Chat (Simulated)",
    weatherUpdate: "Weather Update (Simulated)",
    languageSwitcher: "Language Switcher",
    graphPlotting: "Graph Plotting",
    serperToggle: "Web Search (Serper)",
    chatToTask: "Chat to Task",
    myTasks: "My Tasks",
    noTasks: "No tasks yet.",
    exportShare: "Export & Share",
    exportPdf: "Export to PDF",
    emailChat: "Email Chat",
    shareChat: "Share Chat",
    sharePlatform: "Share Platform",
    loginRegisterModal: "Login / Register",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    login: "Login",
    register: "Register",
    close: "Close",
    extractedTasks: "Extracted Tasks",
    noTasksExtracted: "No actionable tasks were extracted.",
    addSelectedTasks: "Add Selected Tasks",
    cancel: "Cancel",
    startConversation: "Start a conversation with CentONE AI V4...",
    explainQuantum: "Explain quantum physics simply.",
    writeStory: "Write a short story about a talking cat.",
    suggestRecipe: "Suggest a healthy dinner recipe.",
    capitalFrance: "What's the capital of France?",
    copy: "Copy",
    speak: "Speak",
    searchLanguage: "Search Language...",
    settingsModalTitle: "Application Settings",
    serperEnabled: "Web Search Enabled",
    serperDisabled: "Web Search Disabled",
    serperInfo: "Toggle web search integration. (Requires backend proxy for real API usage)",
    promptsModalTitle: "Select a Prompt",
    generalPrompts: "General Prompts",
    creativePrompts: "Creative Prompts",
    technicalPrompts: "Technical Prompts",
    customPromptsGroup: "My Custom Prompts",
    selectPrompt: "Select Prompt",
    closePrompts: "Close Prompts",
    chatGroupToday: "Today",
    chatGroupYesterday: "Yesterday",
    chatGroupLast7Days: "Last 7 Days",
    chatGroupOlder: "Older",
    renameChat: "Rename Chat",
    save: "Save",
    availablePrompts: "Available Prompts",
    newChat: "New Chat",
    codeMode: "Code Mode",
    runCode: "Run Code",
    exitCodeMode: "Exit Code Mode",
    selectLanguage: "Select Language",
    codeOutput: "Code Output",
    connectGoogleWorkspace: "Connect Google Workspace",
    googleWorkspaceInfoTitle: "Google Workspace Integration",
    googleWorkspaceInfo: "Integrating with Google Workspace requires OAuth 2.0 authentication and a secure backend server to handle API calls. This feature would allow CentONE AI V4 to interact with your Google Drive, Calendar, Gmail, and other services after you grant permission. A full implementation would involve setting up a Google Cloud Project and managing API keys and user consent flows securely.",
  },
  es: {
    appTitle: "CentONE IA V4",
    loggedInAs: "Iniciado sesión como:",
    loginRegister: "Iniciar sesión / Registrarse",
    chatHistory: "Historial de chat",
    prompts: "Mensajes",
    addNewPrompt: "Añadir nuevo mensaje personalizado",
    addCustomPrompt: "Añadir Mensaje Personalizado",
    myPrompts: "Mis Mensajes:",
    aiPerformance: "Rendimiento de IA",
    latency: "Latencia:",
    tokenUsage: "Uso de tokens:",
    modelVersion: "Versión del modelo:",
    chatTitle: "Chat CentONE IA V4",
    temperature: "Temp:",
    tone: "Tono:",
    regenerate: "Regenerar",
    stop: "Detener",
    typeMessage: "Escribe tu mensaje...",
    toolsNavigation: "Herramientas y Navegación",
    home: "Inicio (Marcador de posición)",
    settings: "Configuración",
    documentChat: "Chat de Documentos (Simulado)",
    weatherUpdate: "Actualización del Clima (Simulado)",
    languageSwitcher: "Cambiador de Idioma",
    graphPlotting: "Trazado de Gráficos",
    serperToggle: "Búsqueda Web (Serper)",
    chatToTask: "Chat a Tarea",
    myTasks: "Mis Tareas",
    noTasks: "No hay tareas aún.",
    exportShare: "Exportar y Compartir",
    exportPdf: "Exportar a PDF",
    emailChat: "Enviar Chat por Correo",
    shareChat: "Compartir Chat",
    sharePlatform: "Compartir Plataforma",
    loginRegisterModal: "Iniciar sesión / Registrarse",
    emailPlaceholder: "Correo electrónico",
    passwordPlaceholder: "Contraseña",
    login: "Iniciar sesión",
    register: "Registrarse",
    close: "Cerrar",
    extractedTasks: "Tareas Extraídas",
    noTasksExtracted: "No se extrajeron tareas accionables.",
    addSelectedTasks: "Añadir Tareas Seleccionadas",
    cancel: "Cancelar",
    startConversation: "Inicia una conversación con CentONE IA V4...",
    explainQuantum: "Explica la física cuántica de forma sencilla.",
    writeStory: "Escribe un cuento sobre un gato que habla.",
    suggestRecipe: "Sugiere una receta de cena saludable.",
    capitalFrance: "¿Cuál es la capital de Francia?",
    copy: "Copiar",
    speak: "Hablar",
    searchLanguage: "Buscar Idioma...",
    settingsModalTitle: "Configuración de la Aplicación",
    serperEnabled: "Búsqueda Web Habilitada",
    serperDisabled: "Búsqueda Web Deshabilitada",
    serperInfo: "Alternar la integración de búsqueda web. (Requiere proxy de backend para uso real de la API)",
    promptsModalTitle: "Seleccionar un Mensaje",
    generalPrompts: "Mensajes Generales",
    creativePrompts: "Mensajes Creativos",
    technicalPrompts: "Mensajes Técnicos",
    customPromptsGroup: "Mis Mensajes Personalizados",
    selectPrompt: "Seleccionar Mensaje",
    closePrompts: "Cerrar Mensajes",
    chatGroupToday: "Hoy",
    chatGroupYesterday: "Ayer",
    chatGroupLast7Days: "Últimos 7 Días",
    chatGroupOlder: "Antiguos",
    renameChat: "Renombrar Chat",
    save: "Guardar",
    availablePrompts: "Mensajes Disponibles",
    newChat: "Nuevo Chat",
    codeMode: "Modo Código",
    runCode: "Ejecutar Código",
    exitCodeMode: "Salir Modo Código",
    selectLanguage: "Seleccionar Idioma",
    codeOutput: "Salida de Código",
    connectGoogleWorkspace: "Conectar Google Workspace",
    googleWorkspaceInfoTitle: "Integración de Google Workspace",
    googleWorkspaceInfo: "La integración con Google Workspace requiere autenticación OAuth 2.0 y un servidor backend seguro para manejar las llamadas a la API. Esta función permitiría a CentONE AI V4 interactuar con tu Google Drive, Calendario, Gmail y otros servicios después de que otorgues permiso. Una implementación completa implicaría configurar un Proyecto de Google Cloud y gestionar de forma segura las claves de API y los flujos de consentimiento del usuario.",
  },
  fr: {
    appTitle: "CentONE IA V4",
    loggedInAs: "Connecté en tant que :",
    loginRegister: "Connexion / Inscription",
    chatHistory: "Historique du chat",
    prompts: "Invites",
    addNewPrompt: "Ajouter une nouvelle invite personnalisée",
    addCustomPrompt: "Ajouter une invite personnalisée",
    myPrompts: "Mes invites :",
    aiPerformance: "Performances de l'IA",
    latency: "Latence :",
    tokenUsage: "Utilisation des jetons :",
    modelVersion: "Version du modèle :",
    chatTitle: "Chat CentONE IA V4",
    temperature: "Température :",
    tone: "Tonalité :",
    regenerate: "Régénérer",
    stop: "Arrêter",
    typeMessage: "Tapez votre message...",
    toolsNavigation: "Outils et Navigation",
    home: "Accueil (Espace réservé)",
    settings: "Paramètres",
    documentChat: "Chat de documents (Simulé)",
    weatherUpdate: "Mise à jour météo (Simulé)",
    languageSwitcher: "Sélecteur de langue",
    graphPlotting: "Tracé de graphiques",
    serperToggle: "Recherche Web (Serper)",
    chatToTask: "Chat en tâche",
    myTasks: "Mes tâches",
    noTasks: "Pas encore de tâches.",
    exportShare: "Exporter et Partager",
    exportPdf: "Exporter en PDF",
    emailChat: "Envoyer le chat par e-mail",
    shareChat: "Partager le chat",
    sharePlatform: "Partager la plateforme",
    loginRegisterModal: "Connexion / Inscription",
    emailPlaceholder: "E-mail",
    passwordPlaceholder: "Mot de passe",
    login: "Connexion",
    register: "S'inscrire",
    close: "Fermer",
    extractedTasks: "Tâches extraites",
    noTasksExtracted: "Aucune tâche exploitable n'a été extraite.",
    addSelectedTasks: "Ajouter les tâches sélectionnées",
    cancel: "Annuler",
    startConversation: "Commencez une conversation avec CentONE IA V4...",
    explainQuantum: "Expliquez la physique quantique simplement.",
    writeStory: "Écrivez une courte histoire sur un chat qui parle.",
    suggestRecipe: "Suggérez une recette de dîner sain.",
    capitalFrance: "Quelle est la capitale de la France ?",
    copy: "Copier",
    speak: "Parler",
    searchLanguage: "Rechercher une langue...",
    settingsModalTitle: "Paramètres de l'Application",
    serperEnabled: "Recherche Web Activée",
    serperDisabled: "Recherche Web Désactivée",
    serperInfo: "Activer/désactiver l'intégration de la recherche web. (Nécessite un proxy backend pour une utilisation réelle de l'API)",
    promptsModalTitle: "Sélectionner une Invite",
    generalPrompts: "Invites Générales",
    creativePrompts: "Invites Créatives",
    technicalPrompts: "Invites Techniques",
    customPromptsGroup: "Mes Invites Personnalisées",
    selectPrompt: "Sélectionner l'Invite",
    closePrompts: "Fermer les Invites",
    chatGroupToday: "Aujourd'hui",
    chatGroupYesterday: "Hier",
    chatGroupLast7Days: "7 Derniers Jours",
    chatGroupOlder: "Plus Ancien",
    renameChat: "Renommer le Chat",
    save: "Enregistrer",
    availablePrompts: "Invites Disponibles",
    newChat: "Nouveau Chat",
    codeMode: "Mode Code",
    runCode: "Exécuter le Code",
    exitCodeMode: "Quitter le Mode Code",
    selectLanguage: "Sélectionner la Langue",
    codeOutput: "Sortie du Code",
    connectGoogleWorkspace: "Connecter Google Workspace",
    googleWorkspaceInfoTitle: "Intégration de Google Workspace",
    googleWorkspaceInfo: "L'intégration avec Google Workspace nécessite une authentification OAuth 2.0 et un serveur backend sécurisé pour gérer les appels d'API. Cette fonctionnalité permettrait à CentONE AI V4 d'interagir avec votre Google Drive, Agenda, Gmail et d'autres services après que vous ayez accordé l'autorisation. Une implémentation complète impliquerait la configuration d'un projet Google Cloud et la gestion sécurisée des clés API et des flux de consentement utilisateur.",
  },
  de: {
    appTitle: "CentONE KI V4",
    loggedInAs: "Angemeldet als:",
    loginRegister: "Anmelden / Registrieren",
    chatHistory: "Chat-Verlauf",
    prompts: "Eingabeaufforderungen",
    addNewPrompt: "Neue benutzerdefinierte Eingabeaufforderung hinzufügen",
    addCustomPrompt: "Benutzerdefinierte Eingabeaufforderung hinzufügen",
    myPrompts: "Meine Eingabeaufforderungen:",
    aiPerformance: "KI-Leistung",
    latency: "Latenz:",
    tokenUsage: "Token-Nutzung:",
    modelVersion: "Modellversion:",
    chatTitle: "CentONE KI V4 Chat",
    temperature: "Temperatur:",
    tone: "Ton:",
    regenerate: "Neu generieren",
    stop: "Stopp",
    typeMessage: "Geben Sie Ihre Nachricht ein...",
    toolsNavigation: "Tools & Navigation",
    home: "Startseite (Platzhalter)",
    settings: "Einstellungen",
    documentChat: "Dokumenten-Chat (Simuliert)",
    weatherUpdate: "Wetter-Update (Simuliert)",
    languageSwitcher: "Sprachwechsler",
    graphPlotting: "Diagramm-Plotting",
    serperToggle: "Websuche (Serper)",
    chatToTask: "Chat zu Aufgabe",
    myTasks: "Meine Aufgaben",
    noTasks: "Noch keine Aufgaben.",
    exportShare: "Exportieren & Teilen",
    exportPdf: "Als PDF exportieren",
    emailChat: "Chat per E-Mail senden",
    shareChat: "Chat teilen",
    sharePlatform: "Plattform teilen",
    loginRegisterModal: "Anmelden / Registrieren",
    emailPlaceholder: "E-Mail",
    passwordPlaceholder: "Passwort",
    login: "Anmelden",
    register: "Registrieren",
    close: "Schließen",
    extractedTasks: "Extrahierte Aufgaben",
    noTasksExtracted: "Es wurden keine umsetzbaren Aufgaben extrahiert.",
    addSelectedTasks: "Ausgewählte Aufgaben hinzufügen",
    cancel: "Abbrechen",
    startConversation: "Starten Sie eine Unterhaltung mit CentONE KI V4...",
    explainQuantum: "Erklären Sie Quantenphysik einfach.",
    writeStory: "Schreiben Sie eine Kurzgeschichte über eine sprechende Katze.",
    suggestRecipe: "Schlagen Sie ein gesundes Abendessenrezept vor.",
    capitalFrance: "Was ist die Hauptstadt von Frankreich?",
    copy: "Kopieren",
    speak: "Sprechen",
    searchLanguage: "Sprache suchen...",
    settingsModalTitle: "Anwendungseinstellungen",
    serperEnabled: "Websuche aktiviert",
    serperDisabled: "Websuche deaktiviert",
    serperInfo: "Websuche-Integration umschalten. (Erfordert Backend-Proxy für die tatsächliche API-Nutzung)",
    promptsModalTitle: "Eingabeaufforderung auswählen",
    generalPrompts: "Allgemeine Eingabeaufforderungen",
    creativePrompts: "Kreative Eingabeaufforderungen",
    technicalPrompts: "Technische Eingabeaufforderungen",
    customPromptsGroup: "Meine benutzerdefinierten Eingabeaufforderungen",
    selectPrompt: "Eingabeaufforderung auswählen",
    closePrompts: "Eingabeaufforderungen schließen",
    chatGroupToday: "Heute",
    chatGroupYesterday: "Gestern",
    chatGroupLast7Days: "Letzte 7 Tage",
    chatGroupOlder: "Älter",
    renameChat: "Chat umbenennen",
    save: "Speichern",
    availablePrompts: "Verfügbare Eingabeaufforderungen",
    newChat: "Neuer Chat",
    codeMode: "Code-Modus",
    runCode: "Code ausführen",
    exitCodeMode: "Code-Modus verlassen",
    selectLanguage: "Sprache auswählen",
    codeOutput: "Code-Ausgabe",
    connectGoogleWorkspace: "Google Workspace verbinden",
    googleWorkspaceInfoTitle: "Google Workspace-Integration",
    googleWorkspaceInfo: "Die Integration mit Google Workspace erfordert OAuth 2.0-Authentifizierung und einen sicheren Backend-Server zur Verarbeitung von API-Aufrufen. Diese Funktion würde es CentONE AI V4 ermöglichen, nach Ihrer Genehmigung mit Ihrem Google Drive, Kalender, Gmail und anderen Diensten zu interagieren. Eine vollständige Implementierung würde die Einrichtung eines Google Cloud-Projekts und die sichere Verwaltung von API-Schlüsseln und Benutzerzustimmungsflüssen umfassen.",
  },
  it: {
    appTitle: "CentONE AI V4",
    loggedInAs: "Accesso come:",
    loginRegister: "Accedi / Registrati",
    chatHistory: "Cronologia chat",
    prompts: "Prompt",
    addNewPrompt: "Aggiungi nuovo prompt personalizzato",
    addCustomPrompt: "Aggiungi Prompt Personalizzato",
    myPrompts: "I miei prompt:",
    aiPerformance: "Prestazioni AI",
    latency: "Latenza:",
    tokenUsage: "Utilizzo token:",
    modelVersion: "Versione modello:",
    chatTitle: "Chat CentONE AI V4",
    temperature: "Temperatura:",
    tone: "Tono:",
    regenerate: "Rigenera",
    stop: "Ferma",
    typeMessage: "Digita il tuo messaggio...",
    toolsNavigation: "Strumenti e Navigazione",
    home: "Home (Segnaposto)",
    settings: "Impostazioni",
    documentChat: "Chat Documenti (Simulata)",
    weatherUpdate: "Aggiornamento Meteo (Simulato)",
    languageSwitcher: "Selettore lingua",
    graphPlotting: "Tracciamento Grafici",
    serperToggle: "Ricerca Web (Serper)",
    chatToTask: "Chat a Task",
    myTasks: "Le mie attività",
    noTasks: "Nessuna attività ancora.",
    exportShare: "Esporta e Condividi",
    exportPdf: "Esporta in PDF",
    emailChat: "Invia chat via email",
    shareChat: "Condividi chat",
    sharePlatform: "Condividi piattaforma",
    loginRegisterModal: "Accedi / Registrati",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    login: "Accedi",
    register: "Registrati",
    close: "Chiudi",
    extractedTasks: "Attività Estratte",
    noTasksExtracted: "Nessuna attività azionabile è stata estratta.",
    addSelectedTasks: "Aggiungi attività selezionate",
    cancel: "Annulla",
    startConversation: "Inizia una conversazione con CentONE AI V4...",
    explainQuantum: "Spiega la fisica quantistica in modo semplice.",
    writeStory: "Scrivi una breve storia su un gatto parlante.",
    suggestRecipe: "Suggerisci una ricetta per una cena sana.",
    capitalFrance: "Qual è la capitale della Francia?",
    copy: "Copia",
    speak: "Parla",
    searchLanguage: "Cerca lingua...",
    settingsModalTitle: "Impostazioni Applicazione",
    serperEnabled: "Ricerca Web Abilitata",
    serperDisabled: "Ricerca Web Disabilitata",
    serperInfo: "Attiva/disattiva l'integrazione della ricerca web. (Richiede un proxy di backend per l'utilizzo effettivo dell'API)",
    promptsModalTitle: "Seleziona un Prompt",
    generalPrompts: "Prompt Generali",
    creativePrompts: "Prompt Creativi",
    technicalPrompts: "Prompt Tecnici",
    customPromptsGroup: "I miei Prompt Personalizzati",
    selectPrompt: "Seleziona Prompt",
    closePrompts: "Chiudi Prompt",
    chatGroupToday: "Oggi",
    chatGroupYesterday: "Ieri",
    chatGroupLast7Days: "Ultimi 7 Giorni",
    chatGroupOlder: "Meno Recenti",
    renameChat: "Rinomina Chat",
    save: "Salva",
    availablePrompts: "Prompt Disponibili",
    newChat: "Nuova Chat",
    codeMode: "Modalità Codice",
    runCode: "Esegui Codice",
    exitCodeMode: "Esci dalla Modalità Codice",
    selectLanguage: "Seleziona Lingua",
    codeOutput: "Output Codice",
    connectGoogleWorkspace: "Connetti Google Workspace",
    googleWorkspaceInfoTitle: "Integrazione di Google Workspace",
    googleWorkspaceInfo: "L'integrazione con Google Workspace richiede l'autenticazione OAuth 2.0 e un server backend sicuro per gestire le chiamate API. Questa funzione consentirebbe a CentONE AI V4 di interagire con il tuo Google Drive, Calendario, Gmail e altri servizi dopo che avrai concesso l'autorizzazione. Un'implementazione completa implicherebbe la configurazione di un progetto Google Cloud e la gestione sicura delle chiavi API e dei flussi di consenso dell'utente.",
  },
  pt: {
    appTitle: "CentONE AI V4",
    loggedInAs: "Conectado como:",
    loginRegister: "Entrar / Cadastrar",
    chatHistory: "Histórico de chat",
    prompts: "Prompts",
    addNewPrompt: "Adicionar novo prompt personalizado",
    addCustomPrompt: "Adicionar Prompt Personalizado",
    myPrompts: "Meus Prompts:",
    aiPerformance: "Desempenho da IA",
    latency: "Latência:",
    tokenUsage: "Uso de tokens:",
    modelVersion: "Versão do modelo:",
    chatTitle: "Chat CentONE AI V4",
    temperature: "Temperatura:",
    tone: "Tom:",
    regenerate: "Regenerar",
    stop: "Parar",
    typeMessage: "Digite sua mensagem...",
    toolsNavigation: "Ferramentas e Navegação",
    home: "Início (Espaço reservado)",
    settings: "Configurações",
    documentChat: "Chat de Documentos (Simulado)",
    weatherUpdate: "Atualização do Tempo (Simulado)",
    languageSwitcher: "Seletor de Idioma",
    graphPlotting: "Plotagem de Gráficos",
    serperToggle: "Pesquisa Web (Serper)",
    chatToTask: "Chat para Tarefa",
    myTasks: "Minhas Tarefas",
    noTasks: "Nenhuma tarefa ainda.",
    exportShare: "Exportar e Compartilhar",
    exportPdf: "Exportar para PDF",
    emailChat: "Enviar Chat por E-mail",
    shareChat: "Compartilhar Chat",
    sharePlatform: "Compartilhar Plataforma",
    loginRegisterModal: "Entrar / Cadastrar",
    emailPlaceholder: "E-mail",
    passwordPlaceholder: "Senha",
    login: "Entrar",
    register: "Cadastrar",
    close: "Fechar",
    extractedTasks: "Tarefas Extraídas",
    noTasksExtracted: "Nenhuma tarefa acionável foi extraída.",
    addSelectedTasks: "Adicionar Tarefas Selecionadas",
    cancel: "Cancelar",
    startConversation: "Inicie uma conversa com CentONE AI V4...",
    explainQuantum: "Explique a física quântica de forma simples.",
    writeStory: "Escreva uma pequena história sobre um gato falante.",
    suggestRecipe: "Sugira uma receita de jantar saudável.",
    capitalFrance: "Qual é a capital da França?",
    copy: "Copiar",
    speak: "Falar",
    searchLanguage: "Pesquisar Idioma...",
    settingsModalTitle: "Configurações do Aplicativo",
    serperEnabled: "Pesquisa Web Ativada",
    serperDisabled: "Pesquisa Web Desativada",
    serperInfo: "Alternar a integração de pesquisa web. (Requer proxy de backend para uso real da API)",
    promptsModalTitle: "Selecionar um Prompt",
    generalPrompts: "Prompts Gerais",
    creativePrompts: "Prompts Criativos",
    technicalPrompts: "Prompts Técnicos",
    customPromptsGroup: "Meus Prompts Personalizados",
    selectPrompt: "Selecionar Prompt",
    closePrompts: "Fechar Prompts",
    chatGroupToday: "Hoje",
    chatGroupYesterday: "Ontem",
    chatGroupLast7Days: "Últimos 7 Dias",
    chatGroupOlder: "Antigos",
    renameChat: "Renomear Chat",
    save: "Salvar",
    availablePrompts: "Prompts Disponíveis",
    newChat: "Novo Chat",
    codeMode: "Modo Código",
    runCode: "Executar Código",
    exitCodeMode: "Sair do Modo Código",
    selectLanguage: "Selecionar Idioma",
    codeOutput: "Saída de Código",
    connectGoogleWorkspace: "Conectar Google Workspace",
    googleWorkspaceInfoTitle: "Integração do Google Workspace",
    googleWorkspaceInfo: "A integração com o Google Workspace requer autenticação OAuth 2.0 e um servidor de back-end seguro para lidar com chamadas de API. Esse recurso permitiria que o CentONE AI V4 interagisse com seu Google Drive, Agenda, Gmail e outros serviços depois que você concedesse permissão. Uma implementação completa envolveria a configuração de um Projeto do Google Cloud e o gerenciamento seguro de chaves de API e fluxos de consentimento do usuário.",
  },
  ja: {
    appTitle: "CentONE AI V4",
    loggedInAs: "ログイン済み：",
    loginRegister: "ログイン / 登録",
    chatHistory: "チャット履歴",
    prompts: "プロンプト",
    addNewPrompt: "新しいカスタムプロンプトを追加",
    addCustomPrompt: "カスタムプロンプトを追加",
    myPrompts: "マイプロンプト：",
    aiPerformance: "AIパフォーマンス",
    latency: "レイテンシー：",
    tokenUsage: "トークン使用量：",
    modelVersion: "モデルバージョン：",
    chatTitle: "CentONE AI V4 チャット",
    temperature: "温度：",
    tone: "トーン：",
    regenerate: "再生成",
    stop: "停止",
    typeMessage: "メッセージを入力...",
    toolsNavigation: "ツールとナビゲーション",
    home: "ホーム (プレースホルダー)",
    settings: "設定",
    documentChat: "ドキュメントチャット (シミュレーション)",
    weatherUpdate: "天気予報 (シミュレーション)",
    languageSwitcher: "言語切り替え",
    graphPlotting: "グラフ描画",
    serperToggle: "Web検索 (Serper)",
    chatToTask: "チャットからタスクへ",
    myTasks: "マイタスク",
    noTasks: "まだタスクはありません。",
    exportShare: "エクスポートと共有",
    exportPdf: "PDFにエクスポート",
    emailChat: "チャットをメールで送信",
    shareChat: "チャットを共有",
    sharePlatform: "プラットフォームを共有",
    loginRegisterModal: "ログイン / 登録",
    emailPlaceholder: "メールアドレス",
    passwordPlaceholder: "パスワード",
    login: "ログイン",
    register: "登録",
    close: "閉じる",
    extractedTasks: "抽出されたタスク",
    noTasksExtracted: "実行可能なタスクは抽出されませんでした。",
    addSelectedTasks: "選択したタスクを追加",
    cancel: "キャンセル",
    startConversation: "CentONE AI V4 と会話を始めましょう...",
    explainQuantum: "量子物理学を簡単に説明してください。",
    writeStory: "話す猫の短い物語を書いてください。",
    suggestRecipe: "健康的な夕食のレシピを提案してください。",
    capitalFrance: "フランスの首都はどこですか？",
    copy: "コピー",
    speak: "話す",
    searchLanguage: "言語を検索...",
    settingsModalTitle: "アプリケーション設定",
    serperEnabled: "Web検索有効",
    serperDisabled: "Web検索無効",
    serperInfo: "Web検索統合の切り替え。(実際のAPI使用にはバックエンドプロキシが必要)",
    promptsModalTitle: "プロンプトを選択",
    generalPrompts: "一般プロンプト",
    creativePrompts: "クリエイティブプロンプト",
    technicalPrompts: "技術プロンプト",
    customPromptsGroup: "マイカスタムプロンプト",
    selectPrompt: "プロンプトを選択",
    closePrompts: "プロンプトを閉じる",
    chatGroupToday: "今日",
    chatGroupYesterday: "昨日",
    chatGroupLast7Days: "過去7日間",
    chatGroupOlder: "それ以前",
    renameChat: "チャット名を変更",
    save: "保存",
    availablePrompts: "利用可能なプロンプト",
    newChat: "新しいチャット",
    codeMode: "コードモード",
    runCode: "コードを実行",
    exitCodeMode: "コードモードを終了",
    selectLanguage: "言語を選択",
    codeOutput: "コード出力",
    connectGoogleWorkspace: "Google Workspace に接続",
    googleWorkspaceInfoTitle: "Google Workspace 連携",
    googleWorkspaceInfo: "Google Workspace との連携には、OAuth 2.0 認証と、API 呼び出しを処理するための安全なバックエンドサーバーが必要です。この機能により、CentONE AI V4 は、許可を得た後、Google ドライブ、カレンダー、Gmail、その他のサービスと連携できるようになります。完全な実装には、Google Cloud プロジェクトのセットアップと、API キーおよびユーザー同意フローの安全な管理が含まれます。",
  },
  zh: {
    appTitle: "CentONE AI V4",
    loggedInAs: "登录为：",
    loginRegister: "登录 / 注册",
    chatHistory: "聊天记录",
    prompts: "提示",
    addNewPrompt: "添加新的自定义提示",
    addCustomPrompt: "添加自定义提示",
    myPrompts: "我的提示：",
    aiPerformance: "AI 性能",
    latency: "延迟：",
    tokenUsage: "令牌使用：",
    modelVersion: "模型版本：",
    chatTitle: "CentONE AI V4 聊天",
    temperature: "温度：",
    tone: "语气：",
    regenerate: "重新生成",
    stop: "停止",
    typeMessage: "输入您的消息...",
    toolsNavigation: "工具与导航",
    home: "主页 (占位符)",
    settings: "设置",
    documentChat: "文档聊天 (模拟)",
    weatherUpdate: "天气更新 (模拟)",
    languageSwitcher: "语言切换器",
    graphPlotting: "图表绘制",
    serperToggle: "网页搜索 (Serper)",
    chatToTask: "聊天转任务",
    myTasks: "我的任务",
    noTasks: "暂无任务。",
    exportShare: "导出与分享",
    exportPdf: "导出为 PDF",
    emailChat: "通过电子邮件发送聊天",
    shareChat: "分享聊天",
    sharePlatform: "分享平台",
    loginRegisterModal: "登录 / 注册",
    emailPlaceholder: "电子邮件",
    passwordPlaceholder: "密码",
    login: "登录",
    register: "注册",
    close: "关闭",
    extractedTasks: "提取的任务",
    noTasksExtracted: "未提取到可操作的任务。",
    addSelectedTasks: "添加选定任务",
    cancel: "取消",
    startConversation: "与 CentONE AI V4 开始对话...",
    explainQuantum: "简单解释量子物理学。",
    writeStory: "写一个关于会说话的猫的短篇故事。",
    suggestRecipe: "推荐一个健康的晚餐食谱。",
    capitalFrance: "法国的首都是哪里？",
    copy: "复制",
    speak: "朗读",
    searchLanguage: "搜索语言...",
    settingsModalTitle: "应用程序设置",
    serperEnabled: "网页搜索已启用",
    serperDisabled: "网页搜索已禁用",
    serperInfo: "切换网页搜索集成。（需要后端代理才能实际使用 API）",
    promptsModalTitle: "选择提示",
    generalPrompts: "通用提示",
    creativePrompts: "创意提示",
    technicalPrompts: "技术提示",
    customPromptsGroup: "我的自定义提示",
    selectPrompt: "选择提示",
    closePrompts: "关闭提示",
    chatGroupToday: "今天",
    chatGroupYesterday: "昨天",
    chatGroupLast7Days: "最近7天",
    chatGroupOlder: "更早",
    renameChat: "重命名聊天",
    save: "保存",
    availablePrompts: "可用提示",
    newChat: "新聊天",
    codeMode: "代码模式",
    runCode: "运行代码",
    exitCodeMode: "退出代码模式",
    selectLanguage: "选择语言",
    codeOutput: "代码输出",
    connectGoogleWorkspace: "连接 Google Workspace",
    googleWorkspaceInfoTitle: "Google Workspace 集成",
    googleWorkspaceInfo: "与 Google Workspace 集成需要 OAuth 2.0 身份验证和安全的后端服务器来处理 API 调用。此功能将允许 CentONE AI V4 在您授予权限后与您的 Google 云端硬盘、日历、Gmail 和其他服务进行交互。完整的实现将涉及设置 Google Cloud 项目并安全地管理 API 密钥和用户同意流程。",
  },
};


// Main App component
const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [chatTemperature, setChatTemperature] = useState(0.7); // Default temperature
  const [chatTone, setChatTone] = useState('neutral'); // Default tone
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null); // Changed initial state to null
  const [appId, setAppId] = useState('default-app-id');
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null); // For Speech Recognition
  const speechSynthesisRef = useRef(null); // For Text-to-Speech
  const fileInputRef = useRef(null); // For Document Chat

  // State for Custom Prompts
  const [newCustomPrompt, setNewCustomPrompt] = useState('');
  const [userCustomPrompts, setUserCustomPrompts] = useState([]); // User-defined prompts from Firestore

  // Hardcoded prompts (always available)
  const hardcodedPrompts = [
    { group: 'General', text: 'Explain the concept of AI ethics.' },
    { group: 'General', text: 'What is the capital of Australia?' },
    { group: 'Creative', text: 'Write a haiku about a rainy day.' },
    { group: 'Creative', text: 'Draft a short story opening about a detective in a futuristic city.' },
    { group: 'Technical', text: 'How does blockchain technology work?' },
    { group: 'Technical', text: 'Provide a simple Python function for calculating Fibonacci numbers.' },
    { group: 'Technical', text: 'What are the main differences between SQL and NoSQL databases?' },
  ];

  // Simulated AI Performance Info
  const [aiPerformance, setAiPerformance] = useState({
    latency: 'N/A',
    tokenUsage: 'N/A',
    modelVersion: 'DeepSeek-Chat-v1.0'
  });

  // Sidebar state for mobile responsiveness
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // State for Tasks feature
  const [tasks, setTasks] = useState([]);
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isExtractingTasks, setIsExtractingTasks] = useState(false);

  // Language state
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');

  // Settings Modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Serper API Toggle State
  const [isSerperEnabled, setIsSerperEnabled] = useState(false);

  // Prompts Modal state
  const [showPromptsModal, setShowPromptsModal] = useState(false);

  // State for editing chat title
  const [editingChatId, setEditingChatId] = useState(null);
  const [tempChatTitle, setTempChatTitle] = useState('');

  // Code Mode states
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('python'); // Default code language

  // Google Workspace Modal state
  const [showGoogleWorkspaceModal, setShowGoogleWorkspaceModal] = useState(false);

  // Function to get translated text
  const getText = (key) => {
    return translations[currentLanguage][key] || key;
  };

  // DeepSeek AI API configuration (replace with your actual details)
  const DEEPSEEK_API_KEY = ""; // Replace with your actual DeepSeek AI API key
  const DEEPSEEK_API_ENDPOINT = "https://api.deepseek.com/chat/completions"; // Verify DeepSeek's actual endpoint

  // Initialize Firebase and Auth
  useEffect(() => {
    try {
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      const initializedApp = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(initializedApp);
      const firebaseAuth = getAuth(initializedApp);

      setAppId(typeof __app_id !== 'undefined' ? __app_id : 'default-app-id');
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setCurrentUser(user);
          setUserId(user.uid); // User is authenticated, use their UID
        } else {
          setCurrentUser(null);
          setUserId(null); // No user authenticated, set userId to null
          // Only attempt anonymous sign-in if no initial token was provided
          if (typeof __initial_auth_token === 'undefined') {
            try {
              await signInAnonymously(firebaseAuth);
              // The next onAuthStateChanged will then pick up the anonymous user
            } catch (anonError) {
              console.error("Error signing in anonymously:", anonError);
              // If anonymous sign-in fails, userId remains null, and Firestore ops will be blocked.
            }
          }
        }
        setIsAuthReady(true); // Auth state has been processed, even if no user.
      });

      // Attempt to sign in with custom token if available
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
      if (initialAuthToken) {
        signInWithCustomToken(firebaseAuth, initialAuthToken)
          .catch(error => {
            console.error("Error signing in with custom token:", error);
            // Fallback to anonymous if custom token fails, which will be handled by onAuthStateChanged
          });
      }

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setIsAuthReady(true); // Allow app to proceed even if Firebase fails
    }
  }, []);

  // Fetch chat history when auth is ready and userId changes
  useEffect(() => {
    if (!isAuthReady || !db || userId === null) return; // Check for null userId

    const chatsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/chats`);
    const q = query(chatsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatHistory(chats.sort((a, b) => b.createdAt - a.createdAt)); // Sort by creation time
    }, (error) => {
      console.error("Error fetching chat history:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, db, userId, appId]);

  // Load active chat messages
  useEffect(() => {
    if (!isAuthReady || !db || userId === null || !activeChatId) { // Check for null userId
      setMessages([]); // Clear messages if no active chat or not ready
      return;
    }

    const messagesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/chats/${activeChatId}/messages`);
    const q = query(messagesCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp)); // Sort by timestamp
    }, (error) => {
      console.error("Error fetching messages for active chat:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, db, userId, appId, activeChatId]);

  // Fetch tasks when auth is ready and userId changes
  useEffect(() => {
    if (!isAuthReady || !db || userId === null) return;

    const tasksCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/tasks`);
    const q = query(tasksCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(fetchedTasks.sort((a, b) => a.createdAt - b.createdAt));
    }, (error) => {
      console.error("Error fetching tasks:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, db, userId, appId]);

  // Fetch userCustomPrompts from Firestore
  useEffect(() => {
    if (!isAuthReady || !db || userId === null) return;

    const userPromptsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/userPrompts`);
    const unsubscribe = onSnapshot(userPromptsCollectionRef, (snapshot) => {
      const fetchedPrompts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserCustomPrompts(fetchedPrompts);
    }, (error) => {
      console.error("Error fetching user custom prompts:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, db, userId, appId]);

  // Scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to send a message to DeepSeek AI
  const sendMessage = async () => {
    if (!input.trim() || !isAuthReady || !db || userId === null) return; // Check for null userId

    let processedInput = input;
    let graphData = null; // To store potential graph data
    let codeOutput = null; // To store potential code output

    if (chatTone !== 'neutral') {
      processedInput = `Respond in a ${chatTone} tone: ${input}`;
    }

    // Handle Code Mode submission
    if (isCodeMode) {
        // Modify prompt to instruct DeepSeek to return JSON
        const codePromptForDeepSeek = `Simulate running the following ${codeLanguage} code and provide the output. Respond ONLY with a JSON object with 'language', 'code', and 'output' fields. If there's an error, put it in the 'output' field. Code: \`\`\`${codeLanguage}\n${input}\n\`\`\``;

        const codePayloadForDeepSeek = {
            model: selectedModel, // Use the selected DeepSeek model
            messages: [{ role: "user", content: codePromptForDeepSeek }],
            stream: false,
            temperature: chatTemperature,
        };

        try {
            const codeResponse = await fetch(DEEPSEEK_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, // Use DeepSeek API key
                },
                body: JSON.stringify(codePayloadForDeepSeek)
            });

            if (codeResponse.ok) {
                const codeResult = await codeResponse.json();
                const jsonString = codeResult.choices[0]?.message?.content || ""; // DeepSeek returns content as text
                try {
                    const parsedCodeData = JSON.parse(jsonString);
                    if (parsedCodeData.language && parsedCodeData.code !== undefined && parsedCodeData.output !== undefined) {
                        codeOutput = parsedCodeData;
                        processedInput = `Code execution simulated for ${codeLanguage}:`; // AI response text
                    }
                } catch (jsonParseError) {
                    console.error("Error parsing code execution JSON from DeepSeek:", jsonParseError);
                    processedInput = `AI failed to parse code output from DeepSeek. Raw response: ${jsonString}`;
                }
            } else {
                console.error("Error fetching code execution from DeepSeek AI:", codeResponse.status);
                processedInput = `Error simulating code execution: ${codeResponse.statusText}`;
            }
        } catch (error) {
            console.error("Error in code execution generation:", error);
            processedInput = `Failed to simulate code execution: ${error.message}`;
        }
    } else {
        // Simulate web search integration if enabled (only if not in code mode)
        if (isSerperEnabled) {
            // In a real application, this would involve a backend call to Serper API
            // For this simulation, we'll just append a placeholder.
            processedInput += "\n\n[SIMULATED WEB SEARCH RESULTS: Latest news on AI, stock market trends, weather in London]";
        }

        // Check if the user's input suggests a graph request
        if (input.toLowerCase().includes('plot') || input.toLowerCase().includes('chart') || input.toLowerCase().includes('graph')) {
            // Prompt the AI to generate structured data for a graph
            const graphPromptForDeepSeek = `Generate JSON data for a chart based on the following request: "${input}". The JSON should have a 'type' (e.g., 'line', 'bar'), 'title', 'labels' (array of strings), and 'data' (array of numbers). Example: {"type": "bar", "title": "Monthly Sales", "labels": ["Jan", "Feb"], "data": [100, 200]}. If the request is not suitable for a graph, return an empty object {}. Respond ONLY with the JSON object.`;

            const graphPayloadForDeepSeek = {
                model: selectedModel, // Use the selected DeepSeek model
                messages: [{ role: "user", content: graphPromptForDeepSeek }],
                stream: false,
                temperature: chatTemperature,
            };

            try {
                const graphResponse = await fetch(DEEPSEEK_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, // Use DeepSeek API key
                    },
                    body: JSON.stringify(graphPayloadForDeepSeek)
                });

                if (graphResponse.ok) {
                    const graphResult = await graphResponse.json();
                    const jsonString = graphResult.choices[0]?.message?.content || ""; // DeepSeek returns content as text
                    try {
                        const parsedGraphData = JSON.parse(jsonString);
                        if (parsedGraphData.type && parsedGraphData.labels && parsedGraphData.data) {
                            graphData = parsedGraphData;
                            processedInput = `Here is the chart you requested:`; // Change AI response text
                        }
                    } catch (jsonParseError) {
                        console.error("Error parsing graph JSON from DeepSeek:", jsonParseError);
                    }
                } else {
                    console.error("Error fetching graph data from DeepSeek AI:", graphResponse.status);
                }
            } catch (error) {
                console.error("Error in graph data generation:", error);
            }
        }
    }


    const userMessage = { sender: 'user', text: input, timestamp: Date.now() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    let currentChatId = activeChatId;

    // If no active chat, create a new one
    if (!currentChatId) {
      const newChatRef = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chats`), {
        title: userMessage.text.substring(0, 50) + (userMessage.text.length > 50 ? '...' : ''), // Use first part of message as title
        createdAt: Date.now(),
        model: selectedModel,
      });
      currentChatId = newChatRef.id;
      setActiveChatId(currentChatId);
    }

    // Add user message to Firestore
    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chats/${currentChatId}/messages`), userMessage);

    const startTime = Date.now(); // For latency tracking

    try {
      // Prepare messages for DeepSeek API
      const apiMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      apiMessages.push({ role: 'user', content: processedInput }); // Add current user input with tone

      const payload = {
        model: selectedModel,
        messages: apiMessages,
        stream: false,
        temperature: chatTemperature,
      };

      const response = await fetch(DEEPSEEK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const assistantResponseText = data.choices[0]?.message?.content || "No response from AI.";
      const assistantMessage = {
        sender: 'ai',
        text: assistantResponseText,
        timestamp: Date.now(),
        graphData: graphData, // Attach graph data to the message if available
        codeOutput: codeOutput, // Attach code output data if available
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      // Add AI message to Firestore
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chats/${currentChatId}/messages`), assistantMessage);

      // Update AI performance info
      const endTime = Date.now();
      const latency = endTime - startTime;
      setAiPerformance({
        latency: `${latency}ms`,
        tokenUsage: data.usage ? `${data.usage.total_tokens} tokens` : 'N/A',
        modelVersion: data.model || selectedModel,
      });

    } catch (error) {
      console.error("Error calling DeepSeek AI:", error);
      const errorMessage = { sender: 'ai', text: `Error: ${error.message}`, timestamp: Date.now() };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chats/${currentChatId}/messages`), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line in textarea
      sendMessage();
    }
  };

  // Function to start a new chat
  const newChat = () => {
    setActiveChatId(null); // Deselect active chat
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setIsCodeMode(false); // Exit code mode on new chat
  };

  // Function to load a previous chat
  const loadChat = (chatId) => {
    setActiveChatId(chatId);
    setMessages([]); // Messages will be loaded by useEffect
    setInput('');
    setIsLoading(false);
    setIsCodeMode(false); // Exit code mode when loading old chat
    // Close sidebars on mobile after selecting a chat
    if (window.innerWidth < 768) { // md breakpoint
      setIsLeftSidebarOpen(false);
      setIsRightSidebarOpen(false);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      // No alert, but could add a temporary visual feedback
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textarea);
  };

  // Function to export chat to PDF
  const exportChatToPdf = async () => {
    // Check if libraries are loaded
    if (!window.jspdf || !window.html2canvas) {
      console.error("PDF export libraries not loaded.");
      return;
    }

    const { jsPDF } = window.jspdf; // Access jsPDF from the global window object
    const html2canvas = window.html2canvas; // Access html2canvas from the global window object

    const chatContent = chatContainerRef.current;
    if (!chatContent) return;

    const canvas = await html2canvas(chatContent, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`centone_chat_${activeChatId || 'new'}.pdf`);
  };

  // Function to share chat via email
  const shareChatViaEmail = () => {
    const chatText = messages.map(msg => `${msg.sender.toUpperCase()}: ${msg.text}`).join('\n\n');
    const subject = `${getText('appTitle')} Chat Session (${activeChatId || 'New Chat'})`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(chatText)}`;
    window.open(mailtoLink, '_blank');
  };

  // Speech to Text (Microphone Input)
  const startSpeechToText = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn("Web Speech API is not supported by this browser.");
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US'; // Default to English for recognition

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsLoading(false); // Stop loading if error
    };

    recognitionRef.current.onend = () => {
      setIsLoading(false); // Stop loading when recognition ends
    };

    setIsLoading(true); // Indicate listening
    recognitionRef.current.start();
  }, []);

  const stopSpeechToText = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsLoading(false);
    }
  }, []);

  // Text to Speech (AI Response Readout)
  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Text-to-Speech is not supported by this browser.");
      return;
    }
    speechSynthesisRef.current = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    // Set language based on current app language for speech synthesis
    const speechLangMap = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      it: 'it-IT',
      pt: 'pt-PT',
      ja: 'ja-JP',
      zh: 'zh-CN',
    };
    utterance.lang = speechLangMap[currentLanguage] || 'en-US';
    speechSynthesisRef.current.speak(utterance);
  }, [currentLanguage]);

  // Login/Register handlers
  const handleLoginRegister = async (isRegister) => {
    setAuthError('');
    if (!auth) {
      setAuthError("Firebase Auth not initialized.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowLogin(false);
    } catch (error) {
      setAuthError(error.message);
      console.error("Auth error:", error);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setCurrentUser(null);
      setUserId(null); // Set userId to null on logout
      newChat(); // Clear chat on logout
    }
  };

  // Document Chat (Simulated)
  const handleDocumentChat = () => {
    // Ensure fileInputRef.current exists before attempting to click
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    } else {
      console.error("File input ref is null. Cannot open document chat.");
      alert("Error: File input not ready. Please try again or refresh.");
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      alert("Only plain text (.txt) files are supported for this demonstration.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const docPrompt = `Analyze the following document content and provide a summary or answer questions based on it:\n\n${text.substring(0, 2000)}... (truncated for brevity)`; // Truncate large files
      setInput(docPrompt);
      alert("Document content loaded into input. You can now send it to CentONE AI V4.");
      // Optionally, you could directly call sendMessage(docPrompt) here
    };
    reader.readAsText(file);
  };

  const handlePromptSelection = (promptText) => {
    setInput(promptText);
    setShowPromptsModal(false); // Close modal after selection
    // Close sidebars on mobile after selecting a prompt
    if (window.innerWidth < 768) { // md breakpoint
      setIsLeftSidebarOpen(false);
    }
  };

  // Function to add a user-defined custom prompt to Firestore
  const handleAddCustomPrompt = async () => {
    if (newCustomPrompt.trim() && db && userId) {
      try {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/userPrompts`), {
          text: newCustomPrompt.trim(),
          createdAt: Date.now(),
        });
        setNewCustomPrompt('');
      } catch (error) {
        console.error("Error adding custom prompt to Firestore:", error);
        alert("Failed to add custom prompt.");
      }
    }
  };

  const handleWeatherUpdate = () => {
    alert("Fetching live weather data... (This would integrate with a weather API like OpenWeatherMap and require location permissions)");
    // Mock weather data
    const mockWeather = {
      location: "Hyderabad, India",
      temperature: "28°C",
      condition: "Partly Cloudy",
      humidity: "70%",
      wind: "10 km/h NE"
    };
    setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: `Current Weather in ${mockWeather.location}:\nTemperature: ${mockWeather.temperature}\nCondition: ${mockWeather.condition}\nHumidity: ${mockWeather.humidity}\nWind: ${mockWeather.wind}`, timestamp: Date.now() }]);
  };

  const handleLanguageSwitch = (lang) => {
    setCurrentLanguage(lang);
    document.documentElement.lang = lang; // Update HTML lang attribute
    // No alert needed, UI will update
  };

  const handleGraphPlotting = () => {
    // This function is now just a placeholder for the button click.
    // The actual graph generation logic is integrated into sendMessage.
    // User can just type "plot a graph..."
    alert("To plot a graph, simply type your request in the chat input, e.g., 'Plot a bar chart of monthly sales: Jan 100, Feb 120, Mar 90'.");
  };

  const handleSerperToggle = () => {
    setIsSerperEnabled(prev => !prev);
  };

  // New function to extract tasks from chat history using LLM
  const extractTasksFromChat = async () => {
    if (!isAuthReady || !db || userId === null || messages.length === 0) {
      alert("No chat history to extract tasks from or user not authenticated.");
      return;
    }

    setIsExtractingTasks(true);
    setExtractedTasks([]); // Clear previous extracted tasks

    const chatText = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    // Modify prompt to instruct DeepSeek to return JSON
    const taskPromptForDeepSeek = `From the following chat conversation, identify any actionable tasks. Respond ONLY with a JSON array of objects, where each object has a 'description' string and a 'completed' boolean (default to false). If no tasks are found or the conversation is not relevant for tasks, return an empty JSON array [].\n\nChat:\n${chatText}`;

    try {
      const payloadForDeepSeek = {
        model: selectedModel, // Use the selected DeepSeek model
        messages: [{ role: "user", content: taskPromptForDeepSeek }],
        stream: false,
        temperature: chatTemperature,
      };

      const response = await fetch(DEEPSEEK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, // Use DeepSeek API key
        },
        body: JSON.stringify(payloadForDeepSeek)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const jsonString = result.choices[0]?.message?.content || ""; // DeepSeek returns content as text
      try {
        const parsedTasks = JSON.parse(jsonString);
        setExtractedTasks(parsedTasks.map(task => ({ ...task, selected: true }))); // Add 'selected' property
        setShowTaskModal(true); // Show modal with extracted tasks
      } catch (jsonParseError) {
        console.error("Error parsing tasks JSON from DeepSeek:", jsonParseError);
        alert(`AI failed to parse tasks output from DeepSeek. Raw response: ${jsonString}`);
      }
    } catch (error) {
      console.error("Error extracting tasks from LLM:", error);
      alert(`Failed to extract tasks: ${error.message}`);
    } finally {
      setIsExtractingTasks(false);
    }
  };

  // Function to add a task to Firestore
  const addTask = async (description) => {
    if (!db || !userId) {
      alert("Database not ready or user not authenticated.");
      return;
    }
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/tasks`), {
        description: description,
        completed: false,
        createdAt: Date.now(),
      });
      // No alert, as onSnapshot will update UI
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task.");
    }
  };

  // Function to toggle task completion status in Firestore
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    if (!db || !userId) {
      alert("Database not ready or user not authenticated.");
      return;
    }
    try {
      const taskRef = doc(db, `artifacts/${appId}/users/${userId}/tasks`, taskId);
      await updateDoc(taskRef, {
        completed: !currentStatus,
      });
      // No alert, as onSnapshot will update UI
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task status.");
    }
  };

  // Function to delete a task from Firestore
  const deleteTask = async (taskId) => {
    if (!db || !userId) {
      alert("Database not ready or user not authenticated.");
      return;
    }
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/tasks`, taskId));
      // No alert, as onSnapshot will update UI
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task.");
    }
  };

  // Handler for adding selected extracted tasks
  const handleAddExtractedTasks = () => {
    extractedTasks.forEach(task => {
      if (task.selected) { // Assuming a 'selected' property is added in the modal
        addTask(task.description);
      }
    });
    setExtractedTasks([]);
    setShowTaskModal(false);
  };

  const handleSharePlatform = () => {
    alert("Share Platform: Use browser's native share functionality or provide social media links.");
    if (navigator.share) {
      navigator.share({
        title: getText('appTitle'),
        text: 'Check out this awesome AI Chat platform!',
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      prompt("Share this link:", window.location.href);
    }
  };

  const handleShareChat = () => {
    if (activeChatId) {
      alert(`Share Chat: You can share this chat by providing its ID or a unique URL: ${window.location.origin}?chatId=${activeChatId}. This requires public chat access rules in Firestore.`);
    } else {
      alert("Please select or start a chat to share.");
    }
  };

  // Filtered language options based on search term
  const filteredLanguageOptions = Object.keys(translations).filter(langCode =>
    translations[langCode].languageSwitcher.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
    langCode.toLowerCase().includes(languageSearchTerm.toLowerCase())
  ).map(langCode => ({
    code: langCode,
    name: translations[langCode].languageSwitcher.replace('Switcher', '').trim() // Display language name
  }));

  // All prompts for display in modal (combined and grouped)
  const allDisplayPrompts = [
    ...hardcodedPrompts,
    ...userCustomPrompts.map(p => ({ group: 'Custom', text: p.text, id: p.id })) // Add 'Custom' group for user prompts
  ];

  const groupedDisplayPrompts = allDisplayPrompts.reduce((acc, prompt) => {
    const groupNameKey = prompt.group ? `${prompt.group.toLowerCase()}Prompts` : 'otherPrompts';
    const translatedGroupName = getText(groupNameKey) || prompt.group || 'Other'; // Translate group name

    if (!acc[translatedGroupName]) {
      acc[translatedGroupName] = [];
    }
    acc[translatedGroupName].push(prompt);
    return acc;
  }, {});

  // Function to group chat history by date
  const getGroupedChatHistory = (chats) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Start of yesterday

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); // Start of 7 days ago

    const grouped = {
      today: [],
      yesterday: [],
      last7Days: [],
      older: [],
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      chatDate.setHours(0, 0, 0, 0);

      if (chatDate.getTime() === today.getTime()) {
        grouped.today.push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(chat);
      } else if (chatDate >= sevenDaysAgo && chatDate < yesterday) {
        grouped.last7Days.push(chat);
      } else {
        grouped.older.push(chat);
      }
    });

    // Remove empty groups
    for (const key in grouped) {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    }

    return grouped;
  };

  const groupedChatHistory = getGroupedChatHistory(chatHistory);

  // Function to handle renaming chat title
  const handleRenameChat = async (chatId) => {
    if (!db || !userId || !tempChatTitle.trim()) {
      console.error("Cannot rename chat: DB not ready, user not authenticated, or title is empty.");
      setEditingChatId(null); // Exit editing mode
      setTempChatTitle('');
      return;
    }
    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${userId}/chats`, chatId);
      await updateDoc(chatRef, { title: tempChatTitle.trim() });
      setEditingChatId(null); // Exit editing mode
      setTempChatTitle('');
    } catch (error) {
      console.error("Error renaming chat:", error);
      alert("Failed to rename chat.");
    }
  };


  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 font-inter flex overflow-hidden">
      {/* Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 flex-col p-4 shadow-xl overflow-y-auto custom-scrollbar
                    md:relative md:flex ${isLeftSidebarOpen ? 'flex' : 'hidden'} z-50`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light text-blue-300">{getText('appTitle')}</h2>
          <button
            onClick={newChat}
            className="px-3 py-2 bg-blue-600/70 text-white hover:bg-blue-700/70 transition duration-300 ease-in-out shadow-md flex items-center justify-center rounded-md text-sm"
            title="New Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{getText('newChat')}</span>
          </button>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsLeftSidebarOpen(false)}
            className="md:hidden p-2 text-white rounded-md"
            title="Close Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info / Login */}
        <div className="mb-6 pb-4 border-b border-white/20">
          {currentUser ? (
            <div>
              <p className="text-xs text-gray-200 mb-2 font-light">{getText('loggedInAs')}</p>
              <p className="text-sm font-normal text-white break-words">{currentUser.email || `User ID: ${userId}`}</p>
              <button
                onClick={handleLogout}
                className="mt-3 px-3 py-1 text-xs bg-red-600/70 hover:bg-red-700/70 text-white transition duration-300 ease-in-out shadow-sm rounded-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 text-sm bg-green-600/70 hover:bg-green-700/70 text-white transition duration-300 ease-in-out shadow-md w-full rounded-md"
            >
              {getText('loginRegister')}
            </button>
          )}
          <p className="text-xs text-gray-400 mt-2 font-light">App ID: {appId}</p>
          <p className="text-xs text-gray-400 font-light">User ID: {userId || 'Not authenticated'}</p>
        </div>

        {/* Chat History */}
        <div className="mb-6 pb-4 border-b border-white/20">
          <h3 className="text-base font-normal text-gray-200 mb-3">{getText('chatHistory')}</h3>
          <div className="overflow-y-auto custom-scrollbar max-h-48">
            {Object.keys(groupedChatHistory).length === 0 ? (
              <p className="text-xs text-gray-400 font-light">No past chats.</p>
            ) : (
              Object.keys(groupedChatHistory).map(groupName => (
                <div key={groupName} className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    {getText(`chatGroup${groupName.charAt(0).toUpperCase() + groupName.slice(1)}`)}
                  </h4>
                  <ul>
                    {groupedChatHistory[groupName].map((chat) => (
                      <li key={chat.id} className="mb-2 flex items-center group">
                        {editingChatId === chat.id ? (
                          <input
                            type="text"
                            value={tempChatTitle}
                            onChange={(e) => setTempChatTitle(e.target.value)}
                            onBlur={() => handleRenameChat(chat.id)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleRenameChat(chat.id);
                              }
                            }}
                            className="flex-1 p-2 text-xs bg-white/20 text-gray-100 border border-blue-400 focus:outline-none rounded-md"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => loadChat(chat.id)}
                            className={`block flex-1 text-left p-2 text-xs font-normal ${
                              activeChatId === chat.id ? 'bg-blue-700/50 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-200'
                            } transition duration-200 ease-in-out rounded-md`}
                          >
                            {chat.title}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingChatId(chat.id);
                            setTempChatTitle(chat.title);
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"
                          title={getText('renameChat')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prompts Section */}
        <div className="mb-6 pb-4 border-b border-white/20">
          <h3 className="text-base font-normal text-gray-200 mb-3">{getText('prompts')}</h3>
          <div className="space-y-2 mb-3">
            <input
              type="text"
              placeholder={getText('addNewPrompt')}
              className="w-full p-2 text-sm bg-white/10 text-gray-100 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 font-normal rounded-md"
              value={newCustomPrompt}
              onChange={(e) => setNewCustomPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPrompt()}
            />
            <button
              onClick={handleAddCustomPrompt}
              className="w-full px-3 py-2 text-sm bg-purple-600/70 text-white hover:bg-purple-700/70 transition duration-300 ease-in-out shadow-sm rounded-md"
            >
              {getText('addCustomPrompt')}
            </button>
            <button
              onClick={() => setShowPromptsModal(true)}
              className="w-full px-3 py-2 text-sm bg-blue-600/70 text-white hover:bg-blue-700/70 transition duration-300 ease-in-out shadow-sm rounded-md"
            >
              {getText('selectPrompt')}
            </button>
          </div>
        </div>

        {/* AI Performance Information */}
        <div className="mt-auto pt-4 border-t border-white/20">
          <h3 className="text-base font-normal text-gray-200 mb-3">{getText('aiPerformance')}</h3>
          <div className="space-y-2 text-xs font-light text-gray-300">
            <p>{getText('latency')} <span className="font-normal text-white">{aiPerformance.latency}</span></p>
            <p>{getText('tokenUsage')} <span className="font-normal text-white">{aiPerformance.tokenUsage}</span></p>
            <p>{getText('modelVersion')} <span className="font-normal text-white">{aiPerformance.modelVersion}</span></p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-800">
        {/* Top Bar */}
        <div className="p-4 bg-white/10 backdrop-blur-lg flex justify-between items-center border-b border-white/20 shadow-md">
          {/* Left Sidebar Toggle for Mobile */}
          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="md:hidden p-2 text-white rounded-md"
            title="Toggle Left Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-4 flex-grow justify-center md:justify-start">
            <h1 className="text-lg font-normal text-white">{getText('chatTitle')}</h1>
            {/* Model Selector */}
            <select
              className="px-3 py-2 text-sm bg-white/10 text-gray-100 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-300 ease-in-out font-normal rounded-md"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading}
            >
              <option value="deepseek-chat">DeepSeek Chat</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            {/* Temperature Slider (hidden on small screens, moved to settings modal) */}
            <div className="flex items-center space-x-2 hidden md:flex">
              <label htmlFor="temperature" className="text-sm text-gray-300 font-light">{getText('temperature')}:</label>
              <input
                type="range"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={chatTemperature}
                onChange={(e) => setChatTemperature(parseFloat(e.target.value))}
                className="w-20 h-2 bg-white/20 appearance-none cursor-pointer accent-blue-400 rounded-md"
              />
              <span className="text-xs text-gray-300 font-normal">{chatTemperature.toFixed(1)}</span>
            </div>
            {/* Chat Tone Selector (hidden on small screens, moved to settings modal) */}
            <div className="flex items-center space-x-2 hidden md:flex">
              <label htmlFor="chatTone" className="text-sm text-gray-300 font-light">{getText('tone')}:</label>
              <select
                id="chatTone"
                className="px-3 py-2 text-sm bg-white/10 text-gray-100 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-300 ease-in-out font-normal rounded-md"
                value={chatTone}
                onChange={(e) => setChatTone(e.target.value)}
                disabled={isLoading}
              >
                <option value="neutral">Neutral</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="creative">Creative</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>
            {/* Regenerate */}
            <button
              onClick={() => sendMessage()} // Re-send last message
              className="px-3 py-2 text-sm bg-purple-600/70 text-white hover:bg-purple-700/70 transition duration-300 ease-in-out shadow-md flex items-center space-x-2 font-normal rounded-md hidden md:flex"
              disabled={isLoading || messages.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12v1a8 8 0 0015.356 2m-6.356-2H20M9 11V4" />
              </svg>
              <span>{getText('regenerate')}</span>
            </button>
            {/* Stop Response (Placeholder) */}
            <button
              onClick={() => alert("Stop response functionality requires streaming API support and AbortController.")}
              className="px-3 py-2 text-sm bg-red-600/70 text-white hover:bg-red-700/70 transition duration-300 ease-in-out shadow-md flex items-center space-x-2 font-normal rounded-md hidden md:flex"
              disabled={!isLoading} // Only enable if loading
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span>{getText('stop')}</span>
            </button>
          </div>
          {/* Right Sidebar Toggle for Mobile */}
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="md:hidden p-2 text-white rounded-md"
            title="Toggle Right Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Chat Messages Area */}
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-800 to-gray-900">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10 text-sm font-light">
              {getText('startConversation')}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                <button onClick={() => handlePromptSelection(getText('explainQuantum'))} className="p-4 bg-white/10 hover:bg-white/20 text-gray-200 text-xs text-left transition duration-200 ease-in-out shadow-md font-normal rounded-md">
                  {getText('explainQuantum')}
                </button>
                <button onClick={() => handlePromptSelection(getText('writeStory'))} className="p-4 bg-white/10 hover:bg-white/20 text-gray-200 text-xs text-left transition duration-200 ease-in-out shadow-md font-normal rounded-md">
                  {getText('writeStory')}
                </button>
                <button onClick={() => handlePromptSelection(getText('suggestRecipe'))} className="p-4 bg-white/10 hover:bg-white/20 text-gray-200 text-xs text-left transition duration-200 ease-in-out shadow-md font-normal rounded-md">
                  {getText('suggestRecipe')}
                </button>
                <button onClick={() => handlePromptSelection(getText('capitalFrance'))} className="p-4 bg-white/10 hover:bg-white/20 text-gray-200 text-xs text-left transition duration-200 ease-in-out shadow-md font-normal rounded-md">
                  {getText('capitalFrance')}
                </button>
              </div>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={msg.id || index} // Use msg.id if available from Firestore
              className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar for AI */}
              {msg.sender === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold mr-3 shadow-md">
                  AI
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 shadow-md animate-fade-in font-normal rounded-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/30 text-white'
                    : 'bg-white/10 text-gray-200'
                }`}
              >
                <p className="text-sm break-words">{msg.text}</p>
                {/* Render graph if graphData exists */}
                {msg.graphData && (
                  <div className="mt-4 w-full h-64 bg-gray-700 p-2 rounded-md">
                    <h4 className="text-center text-sm font-semibold mb-2">{msg.graphData.title}</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      {msg.graphData.type === 'line' ? (
                        <LineChart data={msg.graphData.labels.map((label, i) => ({ name: label, value: msg.graphData.data[i] }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                          <XAxis dataKey="name" stroke="#cbd5e0" />
                          <YAxis stroke="#cbd5e0" />
                          <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: 'none', color: '#fff' }} />
                          <Legend />
                          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      ) : ( // Default to BarChart
                        <BarChart data={msg.graphData.labels.map((label, i) => ({ name: label, value: msg.graphData.data[i] }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                          <XAxis dataKey="name" stroke="#cbd5e0" />
                          <YAxis stroke="#cbd5e0" />
                          <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: 'none', color: '#fff' }} />
                          <Legend />
                          <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
                {/* Render code output if codeOutput exists */}
                {msg.codeOutput && (
                    <div className="mt-4 w-full bg-gray-700 p-3 rounded-md text-sm">
                        <h4 className="font-semibold mb-2 text-gray-200">{getText('codeOutput')} ({msg.codeOutput.language}):</h4>
                        <pre className="bg-gray-800 p-2 rounded-md overflow-x-auto text-gray-100 font-mono">
                            <code>{msg.codeOutput.code}</code>
                        </pre>
                        <h5 className="font-semibold mt-3 mb-1 text-gray-200">Output:</h5>
                        <pre className="bg-gray-800 p-2 rounded-md overflow-x-auto text-green-300 font-mono">
                            <code>{msg.codeOutput.output}</code>
                        </pre>
                    </div>
                )}
                {msg.sender === 'ai' && (
                  <div className="flex items-center space-x-3 mt-2">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="text-xs text-gray-400 hover:text-gray-300 transition duration-200 ease-in-out flex items-center space-x-1 font-light rounded-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2.586a1 1 0 01-.707-.293l-3.414-3.414a1 1 0 01-.293-.707V5z" />
                      </svg>
                      <span>{getText('copy')}</span>
                    </button>
                    <button
                      onClick={() => speakText(msg.text)}
                      className="text-xs text-gray-400 hover:text-gray-300 transition duration-200 ease-in-out flex items-center space-x-1 font-light rounded-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <span>{getText('speak')}</span>
                    </button>
                  </div>
                )}
              </div>
              {/* Avatar for User */}
              {msg.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold ml-3 shadow-md">
                  YOU
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold mr-3 shadow-md">
                AI
              </div>
              <div className="max-w-[70%] p-3 bg-white/10 text-gray-200 shadow-md rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 animate-bounce-dot rounded-full" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 animate-bounce-dot rounded-full" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 animate-bounce-dot rounded-full" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/10 backdrop-blur-lg flex items-end border-t border-white/20 shadow-lg">
          {/* Code Mode Toggle Button */}
          <button
            onClick={() => setIsCodeMode(prev => !prev)}
            className={`mr-4 px-4 py-3 ${isCodeMode ? 'bg-orange-500/70 hover:bg-orange-600/70' : 'bg-gray-600/70 hover:bg-gray-700/70'} text-white transition duration-300 ease-in-out shadow-lg flex-shrink-0 flex items-center justify-center h-[40px] rounded-md`}
            title={isCodeMode ? getText('exitCodeMode') : getText('codeMode')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="hidden md:block">{isCodeMode ? getText('exitCodeMode') : getText('codeMode')}</span>
          </button>

          {isCodeMode && (
              <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="mr-4 px-3 py-2 text-sm bg-white/10 text-gray-100 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-300 ease-in-out font-normal rounded-md h-[40px]"
              >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  {/* Add more languages as needed */}
              </select>
          )}

          <textarea
            className={`flex-1 p-3 text-sm bg-white/10 text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none custom-scrollbar min-h-[40px] max-h-[120px] font-normal rounded-md ${isCodeMode ? 'font-mono' : ''}`}
            rows="1"
            placeholder={isCodeMode ? `Enter your ${codeLanguage} code...` : getText('typeMessage')}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          ></textarea>
          <button
            onClick={sendMessage}
            className="ml-4 px-4 py-3 bg-blue-500/70 text-white hover:bg-blue-600/70 transition duration-300 ease-in-out shadow-lg flex-shrink-0 flex items-center justify-center h-[40px] w-[40px] rounded-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isCodeMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.121l-3.37-3.37a.75.75 0 00-1.06 1.06l3.37 3.37a.75.75 0 001.06-1.06zM12 21a9 9 0 100-18 9 9 0 000 18zM12 10a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              )
            )}
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-white/10 backdrop-blur-lg border-l border-white/20 flex-col p-4 shadow-xl overflow-y-auto custom-scrollbar
                    md:relative md:flex ${isRightSidebarOpen ? 'flex' : 'hidden'} z-50`}>
        <h3 className="text-base font-normal text-gray-200 mb-6">{getText('toolsNavigation')}</h3>
        {/* Close button for mobile */}
        <button
            onClick={() => setIsRightSidebarOpen(false)}
            className="md:hidden p-2 text-white absolute top-4 right-4 rounded-md"
            title="Close Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        <ul className="space-y-3 flex-1">
          <li>
            <button onClick={() => alert("Navigating to Home...")} className="w-full text-left px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-200 transition duration-200 ease-in-out font-normal rounded-md">
              {getText('home')}
            </button>
          </li>
          <li>
            <button onClick={() => setShowSettingsModal(true)} className="w-full text-left px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-200 transition duration-200 ease-in-out font-normal rounded-md">
              {getText('settings')}
            </button>
          </li>
          <li>
            <button onClick={handleDocumentChat} className="w-full text-left px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-200 transition duration-200 ease-in-out font-normal rounded-md">
              {getText('documentChat')}
            </button>
          </li>
          <li>
            <button onClick={handleWeatherUpdate} className="w-full text-left px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-200 transition duration-300 ease-in-out font-normal rounded-md">
              {getText('weatherUpdate')}
            </button>
          </li>
          <li>
            {/* Language Search Input */}
            <input
              type="text"
              placeholder={getText('searchLanguage')}
              className="w-full p-2 text-sm bg-white/10 text-gray-100 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 font-normal mb-2 rounded-md"
              value={languageSearchTerm}
              onChange={(e) => setLanguageSearchTerm(e.target.value)}
            />
            {/* Language Switcher Dropdown */}
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageSwitch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/10 text-gray-200 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-200 ease-in-out font-normal rounded-md"
            >
              {filteredLanguageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </li>
          <li>
            <button onClick={handleGraphPlotting} className="w-full text-left px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-200 transition duration-200 ease-in-out font-normal rounded-md">
              {getText('graphPlotting')}
            </button>
          </li>
          <li>
            <button
              onClick={extractTasksFromChat}
              className="w-full text-left px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-200 transition duration-200 ease-in-out font-normal rounded-md"
              disabled={isExtractingTasks}
            >
              {isExtractingTasks ? 'Extracting Tasks...' : getText('chatToTask')}
            </button>
          </li>
          <li>
            <button onClick={handleSerperToggle} className={`w-full text-left px-3 py-2 text-sm transition duration-200 ease-in-out font-normal rounded-md ${isSerperEnabled ? 'bg-green-600/70 hover:bg-green-700/70' : 'bg-gray-600/70 hover:bg-gray-700/70'} text-white`}>
              {isSerperEnabled ? getText('serperEnabled') : getText('serperDisabled')}
            </button>
          </li>
          <li>
            <button onClick={() => setShowGoogleWorkspaceModal(true)} className="w-full text-left px-3 py-2 text-sm bg-blue-600/70 hover:bg-blue-700/70 text-white transition duration-200 ease-in-out font-normal rounded-md">
              {getText('connectGoogleWorkspace')}
            </button>
          </li>
        </ul>

        {/* My Tasks Section */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <h3 className="text-base font-normal text-gray-200 mb-3">{getText('myTasks')}</h3>
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-400 font-light">{getText('noTasks')}</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-md">
                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                    {task.description}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      className={`p-1 ${task.completed ? 'bg-yellow-600/70' : 'bg-green-600/70'} text-white text-xs rounded-md`}
                      title={task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                    >
                      {task.completed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 bg-red-600/70 text-white text-xs rounded-md"
                      title="Delete Task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>


        {/* Export & Share Options */}
        <div className="mt-auto pt-4 border-t border-white/20">
          <h3 className="text-base font-normal text-gray-200 mb-3">{getText('exportShare')}</h3>
          <div className="flex flex-col space-y-3">
            <button
              onClick={exportChatToPdf}
              className="px-4 py-2 text-sm bg-indigo-600/70 text-white hover:bg-indigo-700/70 transition duration-300 ease-in-out shadow-md flex items-center justify-center space-x-2 font-normal rounded-md"
              title="Export Chat to PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{getText('exportPdf')}</span>
            </button>
            <button
              onClick={shareChatViaEmail}
              className="px-4 py-2 text-sm bg-teal-600/70 text-white hover:bg-teal-700/70 transition duration-300 ease-in-out shadow-md flex items-center justify-center space-x-2 font-normal rounded-md"
              title="Email Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-1 13a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v14z" />
              </svg>
              <span>{getText('emailChat')}</span>
            </button>
            <button
              onClick={handleShareChat}
              className="px-4 py-2 text-sm bg-yellow-600/70 text-white hover:bg-yellow-700/70 transition duration-300 ease-in-out shadow-md flex items-center justify-center space-x-2 font-normal rounded-md"
              title="Share Current Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>{getText('shareChat')}</span>
            </button>
            <button
              onClick={handleSharePlatform}
              className="px-4 py-2 text-sm bg-orange-600/70 text-white hover:bg-orange-700/70 transition duration-300 ease-in-out shadow-md flex items-center justify-center space-x-2 font-normal rounded-md"
              title="Share Platform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>{getText('sharePlatform')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for document chat */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Keep it hidden
        accept=".txt" // Only accept text files
      />

      {/* Login/Register Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 shadow-2xl w-96 text-gray-100 rounded-md">
            <h2 className="text-lg font-normal mb-6 text-blue-400 text-center">{getText('loginRegisterModal')}</h2>
            {authError && <p className="text-red-400 text-xs mb-4 font-light">{authError}</p>}
            <input
              type="email"
              placeholder={getText('emailPlaceholder')}
              className="w-full p-3 text-sm mb-4 bg-white/5 text-gray-100 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 font-normal rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder={getText('passwordPlaceholder')}
              className="w-full p-3 text-sm mb-6 bg-white/5 text-gray-100 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 font-normal rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => handleLoginRegister(false)}
                className="flex-1 px-4 py-2 text-sm bg-blue-600/70 hover:bg-blue-700/70 text-white transition duration-300 ease-in-out shadow-md font-normal rounded-md"
              >
                {getText('login')}
              </button>
              <button
                onClick={() => handleLoginRegister(true)}
                className="flex-1 px-4 py-2 text-sm bg-green-600/70 hover:bg-green-700/70 text-white transition duration-300 ease-in-out shadow-md font-normal rounded-md"
              >
                {getText('register')}
              </button>
            </div>
            <button
              onClick={() => setShowLogin(false)}
              className="mt-6 w-full px-4 py-2 text-sm bg-gray-600/70 hover:bg-gray-700/70 text-white transition duration-300 ease-in-out shadow-md font-normal rounded-md"
            >
              {getText('close')}
            </button>
          </div>
        </div>
      )}

      {/* Task Extraction Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 shadow-2xl w-full max-w-md text-gray-100 rounded-md">
            <h2 className="text-lg font-normal mb-6 text-blue-400 text-center">{getText('extractedTasks')}</h2>
            {extractedTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center">{getText('noTasksExtracted')}</p>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar mb-6">
                {extractedTasks.map((task, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-white/5 p-3 rounded-md">
                    <input
                      type="checkbox"
                      className="mt-1 form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      checked={task.selected || false}
                      onChange={(e) => {
                        const updated = [...extractedTasks];
                        updated[index].selected = e.target.checked;
                        setExtractedTasks(updated);
                      }}
                    />
                    <label className="flex-1 text-sm text-gray-200 cursor-pointer">{task.description}</label>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between space-x-4">
              <button
                onClick={handleAddExtractedTasks}
                className="flex-1 px-4 py-2 text-sm bg-green-600/70 hover:bg-green-700/70 text-white transition duration-300 ease-in-out shadow-md font-normal rounded-md"
                disabled={extractedTasks.filter(t => t.selected).length === 0}
              >
                {getText('addSelectedTasks')}
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-2 text-sm bg-gray-600/70 hover:bg-gray-700/70 text-white transition duration-300 ease-in-out shadow-md font-normal rounded-md"
              >
                {getText('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 shadow-2xl w-full max-w-md text-gray-100 rounded-md">
            <h2 className="text-lg font-normal mb-6 text-blue-400 text-center">{getText('settingsModalTitle')}</h2>

            <div className="mb-6">
              <label htmlFor="settingsTemperature" className="block text-sm font-light text-gray-300 mb-2">{getText('temperature')}: {chatTemperature.toFixed(1)}</label>
              <input
                type="range"
                id="settingsTemperature"
                min="0"
                max="1"
                step="0.1"
                value={chatTemperature}
                onChange={(e) => setChatTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 appearance-none cursor-pointer accent-blue-400 rounded-md"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="settingsChatTone" className="block text-sm font-light text-gray-300 mb-2">{getText('tone')}:</label>
              <select
                id="settingsChatTone"
                className="w-full px-3 py-2 text-sm bg-white/10 text-gray-100 border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-300 ease-in-out font-normal rounded-md"
                value={chatTone}
                onChange={(e) => setChatTone(e.target.value)}
              >
                <option value="neutral">Neutral</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="creative">Creative</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="serperToggleSwitch" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="serperToggleSwitch"
                    className="sr-only"
                    checked={isSerperEnabled}
                    onChange={handleSerperToggle}
                  />
                  <div className={`block w-14 h-8 rounded-full ${isSerperEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isSerperEnabled ? 'translate-x-full' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-200 font-normal">
                  {isSerperEnabled ? getText('serperEnabled') : getText('serperDisabled')}
                </div>
              </label>
              <p className="text-xs text-gray-400 mt-2 font-light">{getText('serperInfo')}</p>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="mt-6 w-full px-4 py-2 text-sm bg-gray-600/70 hover:bg-gray-700/70 text-white transition duration-300 ease-in-out shadow-md font-normal rounded-md"
            >
              {getText('close')}
            </button>
          </div>
        </div>
      )}

      {/* Prompts Modal */}
      {showPromptsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 shadow-2xl w-full max-w-lg text-gray-100 rounded-md">
            <h2 className="text-lg font-normal mb-6 text-blue-400 text-center">{getText('promptsModalTitle')}</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar mb-6">
              {Object.keys(groupedDisplayPrompts).map(groupName => (
                <div key={groupName} className="mb-4">
                  <h3 className="text-md font-semibold text-gray-300 mb-3">{groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupedDisplayPrompts[groupName].map((prompt, index) => (
                      <button
                        key={prompt.id || index}
                        onClick={() => handlePromptSelection(prompt.text)}
                        className="block w-full text-left p-3 text-sm bg-white/10 hover:bg-white/20 text-gray-200 transition duration-200 ease-in-out shadow-sm font-normal rounded-md"
                      >
                        {prompt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPromptsModal(false)}
              className="w-full px-4 py-2 text-sm bg-gray-600/70 hover:bg-gray-700/70 text-white transition duration-300 ease-in-out shadow-md font-normal rounded-md"
            >
              {getText('closePrompts')}
            </button>
          </div>
        </div>
      )}

      {/* Google Workspace Info Modal */}
      {showGoogleWorkspaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 shadow-2xl w-full max-w-md text-gray-100 rounded-md">
            <h2 className="text-lg font-normal mb-6 text-blue-400 text-center">{getText('googleWorkspaceInfoTitle')}</h2>
            <p className="text-sm text-gray-200 mb-6 font-light">
              {getText('googleWorkspaceInfo')}
            </p>
            <button
              onClick={() => setShowGoogleWorkspaceModal(false)}
              className="mt-6 w-full px-4 py-2 text-sm bg-gray-600/70 hover:bg-gray-700/70 text-white transition duration-300 ease-in-out shadow-md font-normal rounded-md"
            >
              {getText('close')}
            </button>
          </div>
        </div>
      )}

      {/* Tailwind CSS and Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Fira+Code:wght@400;500;600;700&display=swap');

        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          overflow: hidden; /* Prevent body scroll */
        }

        .font-mono {
          font-family: 'Fira Code', monospace;
        }

        /* Custom Scrollbar - Hidden but functional */
        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera*/
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes bounceDot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .animate-bounce-dot {
          animation: bounceDot 1.4s infinite ease-in-out both;
        }

        /* Input Range Slider Styling */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3B82F6; /* blue-500 */
          cursor: pointer;
          border: none;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3B82F6; /* blue-500 */
          cursor: pointer;
          border: none;
        }

        /* Toggle switch styling */
        .dot {
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
      {/* CDN imports for jspdf and html2canvas */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    </div>
  );
};

export default App;
