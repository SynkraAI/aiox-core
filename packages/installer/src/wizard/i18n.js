/**
 * Internationalization (i18n) for AIOS Wizard
 *
 * Supports: English, Portuguese, Spanish
 *
 * @module wizard/i18n
 */

const TRANSLATIONS = {
  en: {
    // Language selection
    selectLanguage: 'Select language:',

    // User Profile (Story 10.2 - Epic 10: User Profile System)
    userProfileQuestion: 'When AI generates code for you, which option best describes you?',
    modoAssistido: 'Assisted Mode',
    modoAssistidoDesc: "I can't tell if the code is right or wrong",
    modoAssistidoHint: 'You talk to Bob, who handles all validation',
    modoAvancado: 'Advanced Mode',
    modoAvancadoDesc: 'I can identify when something is wrong and fix it',
    modoAvancadoHint: 'You have direct access to all agents',
    userProfileSkipped: 'Using existing user profile',
    languageSkipped: 'Using existing language',

    // Project type
    projectTypeQuestion: 'What type of project are you setting up?',
    greenfield: 'Greenfield',
    greenfieldDesc: 'new project from scratch',
    brownfield: 'Brownfield',
    brownfieldDesc: 'existing project',

    // IDE selection
    ideQuestion: 'Select IDE(s):',
    ideHint: 'Space to select, Enter to confirm',
    recommended: 'Recommended',

    // Progress messages
    installingCore: 'Installing AIOS core...',
    installingIDE: 'Configuring IDEs...',
    installingDeps: 'Installing dependencies...',
    configuringEnv: 'Configuring environment...',
    validating: 'Validating installation...',

    // Status
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    skipped: 'Skipped',

    // Completion
    installComplete: 'Installation Complete!',
    readyToUse: 'Your AIOS project is ready.',
    nextSteps: 'Next steps:',
    quickStart: 'Quick Start:',
    quickStartAgents: 'Talk to your AI agents: @dev, @qa, @architect',
    quickStartStory: 'Create a story: @pm *create-story',
    quickStartHelp: 'Get help: @aios-master *help',

    // Cancellation
    cancelConfirm: 'Cancel installation?',
    cancelled: 'Installation cancelled.',
    tryAgain: 'Run `npx aios-core init` to try again.',
    continuing: 'Continuing installation...',

    // Pro Installation Wizard (pro-setup.js)
    proWizardTitle: 'AIOS Pro Installation Wizard',
    proWizardSubtitle: 'Premium Content & Features',
    proLicenseActivation: 'License Activation',
    proContentInstallation: 'Pro Content Installation',
    proVerification: 'Verification',
    proHowActivate: 'How would you like to activate Pro?',
    proLoginOrCreate: 'Login or create account (Recommended)',
    proEnterKey: 'Enter license key (legacy)',
    proEmailLabel: 'Email:',
    proEmailRequired: 'Email is required',
    proEmailInvalid: 'Please enter a valid email address',
    proVerifyingAccess: 'Verifying your access...',
    proNoAccess: 'No AIOS Pro access found for this email.',
    proContactSupport: 'If you believe this is an error, please contact support:',
    proPurchase: 'Purchase Pro: https://pro.synkra.ai',
    proEmailNotBuyer: 'Email not found in Pro buyers list.',
    proAccessConfirmedAccount: 'Pro access confirmed! Account found.',
    proAccessConfirmedCreate: "Pro access confirmed! Let's create your account.",
    proPasswordLabel: 'Password:',
    proPasswordMin: 'Password must be at least {min} characters',
    proAuthenticating: 'Authenticating...',
    proAuthSuccess: 'Authenticated successfully.',
    proEmailNotVerified: 'Email not verified yet. Please check your inbox and click the verification link.',
    proCheckingEvery: '(Checking every 5 seconds... timeout in 10 minutes)',
    proEmailVerified: 'Email verified!',
    proVerificationTimeout: 'Email verification timed out after 10 minutes.',
    proRunAgain: 'Run the installer again to retry.',
    proIncorrectPassword: 'Incorrect password. {remaining} attempt(s) remaining.',
    proMaxAttempts: 'Maximum login attempts reached.',
    proForgotPassword: 'Forgot your password? Visit https://aios-license-server.vercel.app/reset-password',
    proContactSupportEmail: 'Or open an issue: https://github.com/SynkraAI/aios-core/issues',
    proAuthFailed: 'Authentication failed: {message}',
    proCreateAccount: 'Create your AIOS Pro account to get started.',
    proChoosePassword: 'Choose a password:',
    proConfirmPassword: 'Confirm password:',
    proPasswordsNoMatch: 'Passwords do not match',
    proCreatingAccount: 'Creating account...',
    proAccountCreated: 'Account created! Verification email sent.',
    proAccountExists: 'Account already exists. Switching to login...',
    proAccountFailed: 'Account creation failed: {message}',
    proCheckEmail: 'Please check your email and click the verification link.',
    proWaitingVerification: 'Waiting for email verification...',
    proAfterVerifying: 'After verifying, the installation will continue automatically.',
    proPressResend: '[Press R to resend verification email]',
    proVerificationResent: 'Verification email resent.',
    proCouldNotResend: 'Could not resend: {message}',
    proRunAgainRetry: 'Run the installer again to retry verification.',
    proValidatingSubscription: 'Validating Pro subscription...',
    proSubscriptionConfirmed: 'Pro subscription confirmed! License: {key}',
    proNoSubscription: 'No active Pro subscription found for this email.',
    proPurchaseAt: 'Purchase Pro at https://pro.synkra.ai',
    proSeatLimit: 'Deactivate another device or upgrade your license.',
    proAlreadyActivated: 'Pro license already activated for this account.',
    proActivationFailed: 'Activation failed: {message}',
    proEnterKeyPrompt: 'Enter your Pro license key:',
    proKeyRequired: 'License key is required',
    proKeyInvalid: 'Invalid format. Expected: PRO-XXXX-XXXX-XXXX-XXXX',
    proKeyValidated: 'License validated: {key}',
    proModuleNotAvailable: 'Pro license module not available. Ensure @aios-fullstack/pro is installed.',
    proModuleBootstrap: 'Pro license module not found locally. Installing @aios-fullstack/pro to bootstrap...',
    proServerUnreachable: 'License server is unreachable. Check your internet connection and try again.',
    proVerifyingAccessShort: 'Verifying access...',
    proAccessConfirmed: 'Pro access confirmed.',
    proBuyerCheckUnavailable: 'Buyer check unavailable, proceeding with login...',
    proLoginFailedSignup: 'Login failed, attempting signup...',
    proAccountCreatedVerify: 'Account created. Verification email sent!',
    proAccountExistsWrongPw: 'Account exists but the password is incorrect.',
    proAuthFailedShort: 'Authentication failed.',
    proValidatingKey: 'Validating license {key}...',
    proInvalidKey: 'Invalid license key.',
    proExpiredKey: 'License key has expired.',
    proMaxActivations: 'Maximum activations reached for this key.',
    proRateLimited: 'Too many requests. Please wait and try again.',
    proValidationFailed: 'License validation failed: {message}',
    proInvalidKeyFormat: 'Invalid key format: {key}. Expected: PRO-XXXX-XXXX-XXXX-XXXX',
    proScaffolding: 'Scaffolding pro content...',
    proScaffoldingProgress: 'Scaffolding: {message}',
    proContentInstalled: 'Pro content installed ({count} files)',
    proScaffoldFailed: 'Scaffolding failed',
    proScaffoldError: 'Scaffolding error: {message}',
    proInitPackageJson: 'Initializing package.json...',
    proPackageJsonCreated: 'package.json created',
    proPackageJsonFailed: 'Failed to create package.json',
    proInstallingPackage: 'Installing @aios-fullstack/pro...',
    proPackageInstalled: 'Pro package installed',
    proPackageInstallFailed: 'Failed to install Pro package',
    proScaffolderNotAvailable: 'Pro scaffolder not available. Ensure @aios-fullstack/pro is installed.',
    proFilesInstalled: 'Files installed: {count}',
    proSquads: 'Squads: {names}',
    proConfigs: 'Configs: {count} files',
    proFeaturesUnlocked: 'Features unlocked: {count}',
    proInstallComplete: 'AIOS Pro installation complete!',
    proNeedHelp: 'Need help? Run: npx aios-pro recover',
    proCISetEnv: 'CI mode: Set AIOS_PRO_EMAIL + AIOS_PRO_PASSWORD or AIOS_PRO_KEY environment variables.',
    proVerificationFailed: 'Verification failed: {message}',
    proPackageNotFound: 'Pro package not found after npm install. Check npm output.',
    proScaffolderNotFound: 'Pro scaffolder module not found.',
    proNpmInitFailed: 'npm init failed: {message}',
    proNpmInstallFailed: 'npm install @aios-fullstack/pro failed: {message}. Try manually: npm install @aios-fullstack/pro',
  },

  pt: {
    // Language selection
    selectLanguage: 'Selecione o idioma:',

    // User Profile (Story 10.2 - Epic 10: User Profile System)
    // PRD: AIOS v2.0 "Projeto Bob" - Seção 2.4 (exact copy)
    userProfileQuestion: 'Quando uma IA gera código para você, qual dessas opções te descreve melhor?',
    modoAssistido: 'Modo Assistido',
    modoAssistidoDesc: 'Não sei avaliar se o código está certo ou errado',
    modoAssistidoHint: 'Você conversa com Bob, que cuida de toda a validação',
    modoAvancado: 'Modo Avançado',
    modoAvancadoDesc: 'Consigo identificar quando algo está errado e corrigir',
    modoAvancadoHint: 'Você tem acesso direto a todos os agentes',
    userProfileSkipped: 'Usando perfil de usuário existente',
    languageSkipped: 'Usando idioma existente',

    // Project type
    projectTypeQuestion: 'Que tipo de projeto você está configurando?',
    greenfield: 'Greenfield',
    greenfieldDesc: 'projeto novo do zero',
    brownfield: 'Brownfield',
    brownfieldDesc: 'projeto existente',

    // IDE selection
    ideQuestion: 'Selecione IDE(s):',
    ideHint: 'Espaço para selecionar, Enter para confirmar',
    recommended: 'Recomendado',

    // Progress messages
    installingCore: 'Instalando AIOS core...',
    installingIDE: 'Configurando IDEs...',
    installingDeps: 'Instalando dependências...',
    configuringEnv: 'Configurando ambiente...',
    validating: 'Validando instalação...',

    // Status
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Aviso',
    skipped: 'Pulado',

    // Completion
    installComplete: 'Instalação Completa!',
    readyToUse: 'Seu projeto AIOS está pronto.',
    nextSteps: 'Próximos passos:',
    quickStart: 'Início Rápido:',
    quickStartAgents: 'Converse com seus agentes IA: @dev, @qa, @architect',
    quickStartStory: 'Crie uma story: @pm *create-story',
    quickStartHelp: 'Obtenha ajuda: @aios-master *help',

    // Cancellation
    cancelConfirm: 'Cancelar instalação?',
    cancelled: 'Instalação cancelada.',
    tryAgain: 'Execute `npx aios-core init` para tentar novamente.',
    continuing: 'Continuando instalação...',

    // Pro Installation Wizard (pro-setup.js)
    proWizardTitle: 'Assistente de Instalação AIOS Pro',
    proWizardSubtitle: 'Conteúdo e Recursos Premium',
    proLicenseActivation: 'Ativação de Licença',
    proContentInstallation: 'Instalação do Conteúdo Pro',
    proVerification: 'Verificação',
    proHowActivate: 'Como você gostaria de ativar o Pro?',
    proLoginOrCreate: 'Login ou criar conta (Recomendado)',
    proEnterKey: 'Inserir chave de licença (legado)',
    proEmailLabel: 'Email:',
    proEmailRequired: 'Email é obrigatório',
    proEmailInvalid: 'Por favor, insira um endereço de email válido',
    proVerifyingAccess: 'Verificando seu acesso...',
    proNoAccess: 'Nenhum acesso AIOS Pro encontrado para este email.',
    proContactSupport: 'Se você acredita que isso é um erro, entre em contato com o suporte:',
    proPurchase: 'Comprar Pro: https://pro.synkra.ai',
    proEmailNotBuyer: 'Email não encontrado na lista de compradores Pro.',
    proAccessConfirmedAccount: 'Acesso Pro confirmado! Conta encontrada.',
    proAccessConfirmedCreate: 'Acesso Pro confirmado! Vamos criar sua conta.',
    proPasswordLabel: 'Senha:',
    proPasswordMin: 'A senha deve ter pelo menos {min} caracteres',
    proAuthenticating: 'Autenticando...',
    proAuthSuccess: 'Autenticado com sucesso.',
    proEmailNotVerified: 'Email ainda não verificado. Verifique sua caixa de entrada e clique no link de verificação.',
    proCheckingEvery: '(Verificando a cada 5 segundos... tempo limite de 10 minutos)',
    proEmailVerified: 'Email verificado!',
    proVerificationTimeout: 'Verificação de email expirou após 10 minutos.',
    proRunAgain: 'Execute o instalador novamente para tentar.',
    proIncorrectPassword: 'Senha incorreta. {remaining} tentativa(s) restante(s).',
    proMaxAttempts: 'Número máximo de tentativas de login atingido.',
    proForgotPassword: 'Esqueceu sua senha? Acesse https://aios-license-server.vercel.app/reset-password',
    proContactSupportEmail: 'Ou abra uma issue: https://github.com/SynkraAI/aios-core/issues',
    proAuthFailed: 'Falha na autenticação: {message}',
    proCreateAccount: 'Crie sua conta AIOS Pro para começar.',
    proChoosePassword: 'Escolha uma senha:',
    proConfirmPassword: 'Confirme a senha:',
    proPasswordsNoMatch: 'As senhas não correspondem',
    proCreatingAccount: 'Criando conta...',
    proAccountCreated: 'Conta criada! Email de verificação enviado.',
    proAccountExists: 'Conta já existe. Mudando para login...',
    proAccountFailed: 'Falha ao criar conta: {message}',
    proCheckEmail: 'Por favor, verifique seu email e clique no link de verificação.',
    proWaitingVerification: 'Aguardando verificação de email...',
    proAfterVerifying: 'Após verificar, a instalação continuará automaticamente.',
    proPressResend: '[Pressione R para reenviar email de verificação]',
    proVerificationResent: 'Email de verificação reenviado.',
    proCouldNotResend: 'Não foi possível reenviar: {message}',
    proRunAgainRetry: 'Execute o instalador novamente para tentar a verificação.',
    proValidatingSubscription: 'Validando assinatura Pro...',
    proSubscriptionConfirmed: 'Assinatura Pro confirmada! Licença: {key}',
    proNoSubscription: 'Nenhuma assinatura Pro ativa encontrada para este email.',
    proPurchaseAt: 'Compre o Pro em https://pro.synkra.ai',
    proSeatLimit: 'Desative outro dispositivo ou faça upgrade da sua licença.',
    proAlreadyActivated: 'Licença Pro já ativada para esta conta.',
    proActivationFailed: 'Falha na ativação: {message}',
    proEnterKeyPrompt: 'Insira sua chave de licença Pro:',
    proKeyRequired: 'Chave de licença é obrigatória',
    proKeyInvalid: 'Formato inválido. Esperado: PRO-XXXX-XXXX-XXXX-XXXX',
    proKeyValidated: 'Licença validada: {key}',
    proModuleNotAvailable: 'Módulo de licença Pro não disponível. Certifique-se de que @aios-fullstack/pro está instalado.',
    proModuleBootstrap: 'Módulo de licença Pro não encontrado localmente. Instalando @aios-fullstack/pro...',
    proServerUnreachable: 'Servidor de licenças inacessível. Verifique sua conexão com a internet e tente novamente.',
    proVerifyingAccessShort: 'Verificando acesso...',
    proAccessConfirmed: 'Acesso Pro confirmado.',
    proBuyerCheckUnavailable: 'Verificação de comprador indisponível, prosseguindo com login...',
    proLoginFailedSignup: 'Login falhou, tentando cadastro...',
    proAccountCreatedVerify: 'Conta criada. Email de verificação enviado!',
    proAccountExistsWrongPw: 'Conta existe mas a senha está incorreta.',
    proAuthFailedShort: 'Falha na autenticação.',
    proValidatingKey: 'Validando licença {key}...',
    proInvalidKey: 'Chave de licença inválida.',
    proExpiredKey: 'Chave de licença expirada.',
    proMaxActivations: 'Número máximo de ativações atingido para esta chave.',
    proRateLimited: 'Muitas requisições. Aguarde e tente novamente.',
    proValidationFailed: 'Validação de licença falhou: {message}',
    proInvalidKeyFormat: 'Formato de chave inválido: {key}. Esperado: PRO-XXXX-XXXX-XXXX-XXXX',
    proScaffolding: 'Instalando conteúdo pro...',
    proScaffoldingProgress: 'Instalando: {message}',
    proContentInstalled: 'Conteúdo Pro instalado ({count} arquivos)',
    proScaffoldFailed: 'Instalação falhou',
    proScaffoldError: 'Erro na instalação: {message}',
    proInitPackageJson: 'Inicializando package.json...',
    proPackageJsonCreated: 'package.json criado',
    proPackageJsonFailed: 'Falha ao criar package.json',
    proInstallingPackage: 'Instalando @aios-fullstack/pro...',
    proPackageInstalled: 'Pacote Pro instalado',
    proPackageInstallFailed: 'Falha ao instalar pacote Pro',
    proScaffolderNotAvailable: 'Scaffolder Pro não disponível. Certifique-se de que @aios-fullstack/pro está instalado.',
    proFilesInstalled: 'Arquivos instalados: {count}',
    proSquads: 'Squads: {names}',
    proConfigs: 'Configs: {count} arquivos',
    proFeaturesUnlocked: 'Recursos desbloqueados: {count}',
    proInstallComplete: 'Instalação do AIOS Pro completa!',
    proNeedHelp: 'Precisa de ajuda? Execute: npx aios-pro recover',
    proCISetEnv: 'Modo CI: Defina as variáveis AIOS_PRO_EMAIL + AIOS_PRO_PASSWORD ou AIOS_PRO_KEY.',
    proVerificationFailed: 'Verificação falhou: {message}',
    proPackageNotFound: 'Pacote Pro não encontrado após npm install. Verifique a saída do npm.',
    proScaffolderNotFound: 'Módulo scaffolder Pro não encontrado.',
    proNpmInitFailed: 'npm init falhou: {message}',
    proNpmInstallFailed: 'npm install @aios-fullstack/pro falhou: {message}. Tente manualmente: npm install @aios-fullstack/pro',
  },

  es: {
    // Language selection
    selectLanguage: 'Seleccione idioma:',

    // User Profile (Story 10.2 - Epic 10: User Profile System)
    userProfileQuestion: 'Cuando una IA genera código para ti, ¿cuál de estas opciones te describe mejor?',
    modoAssistido: 'Modo Asistido',
    modoAssistidoDesc: 'No sé evaluar si el código está bien o mal',
    modoAssistidoHint: 'Hablas con Bob, que se encarga de toda la validación',
    modoAvancado: 'Modo Avanzado',
    modoAvancadoDesc: 'Puedo identificar cuando algo está mal y corregirlo',
    modoAvancadoHint: 'Tienes acceso directo a todos los agentes',
    userProfileSkipped: 'Usando perfil de usuario existente',
    languageSkipped: 'Usando idioma existente',

    // Project type
    projectTypeQuestion: '¿Qué tipo de proyecto estás configurando?',
    greenfield: 'Greenfield',
    greenfieldDesc: 'proyecto nuevo desde cero',
    brownfield: 'Brownfield',
    brownfieldDesc: 'proyecto existente',

    // IDE selection
    ideQuestion: 'Seleccione IDE(s):',
    ideHint: 'Espacio para seleccionar, Enter para confirmar',
    recommended: 'Recomendado',

    // Progress messages
    installingCore: 'Instalando AIOS core...',
    installingIDE: 'Configurando IDEs...',
    installingDeps: 'Instalando dependencias...',
    configuringEnv: 'Configurando ambiente...',
    validating: 'Validando instalación...',

    // Status
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    skipped: 'Omitido',

    // Completion
    installComplete: '¡Instalación Completa!',
    readyToUse: 'Tu proyecto AIOS está listo.',
    nextSteps: 'Próximos pasos:',
    quickStart: 'Inicio Rápido:',
    quickStartAgents: 'Habla con tus agentes IA: @dev, @qa, @architect',
    quickStartStory: 'Crea una story: @pm *create-story',
    quickStartHelp: 'Obtén ayuda: @aios-master *help',

    // Cancellation
    cancelConfirm: '¿Cancelar instalación?',
    cancelled: 'Instalación cancelada.',
    tryAgain: 'Ejecute `npx aios-core init` para intentar nuevamente.',
    continuing: 'Continuando instalación...',

    // Pro Installation Wizard (pro-setup.js)
    proWizardTitle: 'Asistente de Instalación AIOS Pro',
    proWizardSubtitle: 'Contenido y Funciones Premium',
    proLicenseActivation: 'Activación de Licencia',
    proContentInstallation: 'Instalación del Contenido Pro',
    proVerification: 'Verificación',
    proHowActivate: '¿Cómo te gustaría activar Pro?',
    proLoginOrCreate: 'Iniciar sesión o crear cuenta (Recomendado)',
    proEnterKey: 'Ingresar clave de licencia (legado)',
    proEmailLabel: 'Email:',
    proEmailRequired: 'Email es obligatorio',
    proEmailInvalid: 'Por favor, ingrese una dirección de email válida',
    proVerifyingAccess: 'Verificando tu acceso...',
    proNoAccess: 'No se encontró acceso AIOS Pro para este email.',
    proContactSupport: 'Si cree que esto es un error, contacte al soporte:',
    proPurchase: 'Comprar Pro: https://pro.synkra.ai',
    proEmailNotBuyer: 'Email no encontrado en la lista de compradores Pro.',
    proAccessConfirmedAccount: '¡Acceso Pro confirmado! Cuenta encontrada.',
    proAccessConfirmedCreate: '¡Acceso Pro confirmado! Vamos a crear tu cuenta.',
    proPasswordLabel: 'Contraseña:',
    proPasswordMin: 'La contraseña debe tener al menos {min} caracteres',
    proAuthenticating: 'Autenticando...',
    proAuthSuccess: 'Autenticado exitosamente.',
    proEmailNotVerified: 'Email aún no verificado. Revise su bandeja de entrada y haga clic en el enlace de verificación.',
    proCheckingEvery: '(Verificando cada 5 segundos... tiempo límite de 10 minutos)',
    proEmailVerified: '¡Email verificado!',
    proVerificationTimeout: 'Verificación de email expiró después de 10 minutos.',
    proRunAgain: 'Ejecute el instalador nuevamente para reintentar.',
    proIncorrectPassword: 'Contraseña incorrecta. {remaining} intento(s) restante(s).',
    proMaxAttempts: 'Número máximo de intentos de inicio de sesión alcanzado.',
    proForgotPassword: '¿Olvidó su contraseña? Visite https://aios-license-server.vercel.app/reset-password',
    proContactSupportEmail: 'O abra un issue: https://github.com/SynkraAI/aios-core/issues',
    proAuthFailed: 'Error de autenticación: {message}',
    proCreateAccount: 'Cree su cuenta AIOS Pro para comenzar.',
    proChoosePassword: 'Elija una contraseña:',
    proConfirmPassword: 'Confirme la contraseña:',
    proPasswordsNoMatch: 'Las contraseñas no coinciden',
    proCreatingAccount: 'Creando cuenta...',
    proAccountCreated: '¡Cuenta creada! Email de verificación enviado.',
    proAccountExists: 'La cuenta ya existe. Cambiando a inicio de sesión...',
    proAccountFailed: 'Error al crear la cuenta: {message}',
    proCheckEmail: 'Por favor, revise su email y haga clic en el enlace de verificación.',
    proWaitingVerification: 'Esperando verificación de email...',
    proAfterVerifying: 'Después de verificar, la instalación continuará automáticamente.',
    proPressResend: '[Presione R para reenviar email de verificación]',
    proVerificationResent: 'Email de verificación reenviado.',
    proCouldNotResend: 'No se pudo reenviar: {message}',
    proRunAgainRetry: 'Ejecute el instalador nuevamente para reintentar la verificación.',
    proValidatingSubscription: 'Validando suscripción Pro...',
    proSubscriptionConfirmed: '¡Suscripción Pro confirmada! Licencia: {key}',
    proNoSubscription: 'No se encontró suscripción Pro activa para este email.',
    proPurchaseAt: 'Compre Pro en https://pro.synkra.ai',
    proSeatLimit: 'Desactive otro dispositivo o actualice su licencia.',
    proAlreadyActivated: 'Licencia Pro ya activada para esta cuenta.',
    proActivationFailed: 'Error de activación: {message}',
    proEnterKeyPrompt: 'Ingrese su clave de licencia Pro:',
    proKeyRequired: 'Clave de licencia es obligatoria',
    proKeyInvalid: 'Formato inválido. Esperado: PRO-XXXX-XXXX-XXXX-XXXX',
    proKeyValidated: 'Licencia validada: {key}',
    proModuleNotAvailable: 'Módulo de licencia Pro no disponible. Asegúrese de que @aios-fullstack/pro esté instalado.',
    proModuleBootstrap: 'Módulo de licencia Pro no encontrado localmente. Instalando @aios-fullstack/pro...',
    proServerUnreachable: 'Servidor de licencias inaccesible. Verifique su conexión a internet e intente nuevamente.',
    proVerifyingAccessShort: 'Verificando acceso...',
    proAccessConfirmed: 'Acceso Pro confirmado.',
    proBuyerCheckUnavailable: 'Verificación de comprador no disponible, procediendo con inicio de sesión...',
    proLoginFailedSignup: 'Inicio de sesión fallido, intentando registro...',
    proAccountCreatedVerify: 'Cuenta creada. ¡Email de verificación enviado!',
    proAccountExistsWrongPw: 'La cuenta existe pero la contraseña es incorrecta.',
    proAuthFailedShort: 'Error de autenticación.',
    proValidatingKey: 'Validando licencia {key}...',
    proInvalidKey: 'Clave de licencia inválida.',
    proExpiredKey: 'Clave de licencia expirada.',
    proMaxActivations: 'Número máximo de activaciones alcanzado para esta clave.',
    proRateLimited: 'Demasiadas solicitudes. Espere e intente nuevamente.',
    proValidationFailed: 'Validación de licencia fallida: {message}',
    proInvalidKeyFormat: 'Formato de clave inválido: {key}. Esperado: PRO-XXXX-XXXX-XXXX-XXXX',
    proScaffolding: 'Instalando contenido pro...',
    proScaffoldingProgress: 'Instalando: {message}',
    proContentInstalled: 'Contenido Pro instalado ({count} archivos)',
    proScaffoldFailed: 'Instalación fallida',
    proScaffoldError: 'Error de instalación: {message}',
    proInitPackageJson: 'Inicializando package.json...',
    proPackageJsonCreated: 'package.json creado',
    proPackageJsonFailed: 'Error al crear package.json',
    proInstallingPackage: 'Instalando @aios-fullstack/pro...',
    proPackageInstalled: 'Paquete Pro instalado',
    proPackageInstallFailed: 'Error al instalar paquete Pro',
    proScaffolderNotAvailable: 'Scaffolder Pro no disponible. Asegúrese de que @aios-fullstack/pro esté instalado.',
    proFilesInstalled: 'Archivos instalados: {count}',
    proSquads: 'Squads: {names}',
    proConfigs: 'Configs: {count} archivos',
    proFeaturesUnlocked: 'Funciones desbloqueadas: {count}',
    proInstallComplete: '¡Instalación de AIOS Pro completa!',
    proNeedHelp: '¿Necesita ayuda? Ejecute: npx aios-pro recover',
    proCISetEnv: 'Modo CI: Configure las variables AIOS_PRO_EMAIL + AIOS_PRO_PASSWORD o AIOS_PRO_KEY.',
    proVerificationFailed: 'Verificación fallida: {message}',
    proPackageNotFound: 'Paquete Pro no encontrado después de npm install. Verifique la salida de npm.',
    proScaffolderNotFound: 'Módulo scaffolder Pro no encontrado.',
    proNpmInitFailed: 'npm init falló: {message}',
    proNpmInstallFailed: 'npm install @aios-fullstack/pro falló: {message}. Intente manualmente: npm install @aios-fullstack/pro',
  },
};

// Current language (default: English)
let currentLanguage = 'en';

/**
 * Set current language
 * @param {string} lang - Language code (en, pt, es)
 */
function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLanguage = lang;
  }
}

/**
 * Get current language
 * @returns {string} Current language code
 */
function getLanguage() {
  return currentLanguage;
}

/**
 * Get translated string
 * @param {string} key - Translation key
 * @returns {string} Translated string
 */
function t(key) {
  return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS['en'][key] || key;
}

/**
 * Get translated string with placeholder substitution.
 * Placeholders use {name} syntax.
 *
 * @param {string} key - Translation key
 * @param {Object} [params={}] - Placeholder values
 * @returns {string} Translated string with substitutions
 * @example tf('proIncorrectPassword', { remaining: 2 })
 */
function tf(key, params = {}) {
  let str = t(key);
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
}

/**
 * Get language selection choices
 * @returns {Array} Inquirer choices
 */
function getLanguageChoices() {
  return [
    { name: 'English', value: 'en' },
    { name: 'Português', value: 'pt' },
    { name: 'Español', value: 'es' },
  ];
}

module.exports = {
  setLanguage,
  getLanguage,
  t,
  tf,
  getLanguageChoices,
  TRANSLATIONS,
};
