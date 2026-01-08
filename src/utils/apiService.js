// Serviço de API para sincronização de dados
// Este é um mock que pode ser facilmente substituído por chamadas reais à API

const API_URL = 'https://cei-api.example.com'; // Substituir pela URL real da API
const STORAGE_KEY = 'cei_data';
const LAST_SYNC_KEY = 'cei_last_sync';

class ApiService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Monitorar status online/offline
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Conexão restaurada - iniciando sincronização');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Sem conexão - modo offline ativado');
    });
  }

  // Verifica se está online
  checkOnlineStatus() {
    return this.isOnline && navigator.onLine;
  }

  // Simula chamada à API (substituir por fetch real quando backend estiver pronto)
  async fetchFromAPI(endpoint, options = {}) {
    if (!this.checkOnlineStatus()) {
      throw new Error('Sem conexão com a internet');
    }

    // MOCK: Retorna dados do localStorage por enquanto
    // TODO: Substituir por fetch real quando backend estiver disponível
    /*
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
        ...options.headers
      }
    }).then(res => res.json());
    */
    
    // Mock temporário - retorna dados locais
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : null;
  }

  // Buscar todos os dados do servidor
  async getDadosOnline(instituicaoId) {
    try {
      if (!this.checkOnlineStatus()) {
        console.log('Offline - usando dados locais');
        return this.getDadosLocal();
      }

      // TODO: Implementar quando backend estiver pronto
      /*
      const response = await this.fetchFromAPI(`/dados/${instituicaoId}`);
      
      // Salvar no cache local
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      
      return response;
      */

      // Mock: retorna dados locais por enquanto
      console.log('Mock: retornando dados locais (backend não implementado)');
      return this.getDadosLocal();
      
    } catch (error) {
      console.error('Erro ao buscar dados online:', error);
      // Fallback para dados locais
      return this.getDadosLocal();
    }
  }

  // Enviar dados para o servidor
  async enviarDadosOnline(dados) {
    try {
      if (!this.checkOnlineStatus()) {
        console.log('Offline - dados salvos localmente, aguardando sincronização');
        this.salvarDadosLocal(dados);
        return { sucesso: false, offline: true };
      }

      // TODO: Implementar quando backend estiver pronto
      /*
      const response = await this.fetchFromAPI('/dados', {
        method: 'POST',
        body: JSON.stringify(dados)
      });
      
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      
      return { sucesso: true, data: response };
      */

      // Mock: salva localmente por enquanto
      console.log('Mock: salvando localmente (backend não implementado)');
      this.salvarDadosLocal(dados);
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      
      return { sucesso: true, offline: false };
      
    } catch (error) {
      console.error('Erro ao enviar dados online:', error);
      // Salvar localmente em caso de erro
      this.salvarDadosLocal(dados);
      return { sucesso: false, erro: error.message };
    }
  }

  // Sincronizar dados (merge inteligente)
  async sincronizarDados(dadosLocais) {
    if (this.syncInProgress) {
      console.log('Sincronização já em andamento');
      return dadosLocais;
    }

    try {
      this.syncInProgress = true;
      
      if (!this.checkOnlineStatus()) {
        console.log('Sem conexão - sincronização adiada');
        return dadosLocais;
      }

      console.log('Iniciando sincronização...');

      // TODO: Implementar lógica real quando backend estiver pronto
      /*
      // 1. Buscar dados do servidor
      const dadosOnline = await this.getDadosOnline();
      
      // 2. Fazer merge dos dados (priorizar dados online)
      const dadosMerged = this.mergeDados(dadosOnline, dadosLocais);
      
      // 3. Enviar dados locais novos para o servidor
      await this.enviarDadosOnline(dadosMerged);
      
      // 4. Salvar resultado localmente
      this.salvarDadosLocal(dadosMerged);
      
      return dadosMerged;
      */

      // Mock: retorna dados locais
      console.log('Mock: sincronização simulada (backend não implementado)');
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return dadosLocais;
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return dadosLocais;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Merge de dados (prioriza dados online)
  mergeDados(dadosOnline, dadosLocais) {
    if (!dadosOnline) return dadosLocais;
    if (!dadosLocais) return dadosOnline;

    // Estratégia: dados online têm prioridade, exceto se locais forem mais recentes
    const merged = { ...dadosOnline };

    // Merge de arrays por ID e timestamp
    ['instituicoes', 'livros', 'patrimonio', 'clientes', 'emprestimos', 'usuarios', 'notasFiscais'].forEach(key => {
      if (dadosLocais[key] && dadosOnline[key]) {
        merged[key] = this.mergeArray(dadosOnline[key], dadosLocais[key]);
      } else if (dadosLocais[key]) {
        merged[key] = dadosLocais[key];
      }
    });

    return merged;
  }

  // Merge de arrays mantendo itens mais recentes
  mergeArray(arrayOnline, arrayLocal) {
    const merged = [...arrayOnline];
    const onlineIds = new Set(arrayOnline.map(item => item.id));

    // Adicionar itens locais que não existem online
    arrayLocal.forEach(itemLocal => {
      if (!onlineIds.has(itemLocal.id)) {
        merged.push(itemLocal);
      } else {
        // Se existe nos dois, manter o mais recente (por dataAtualizacao ou dataCadastro)
        const itemOnline = arrayOnline.find(i => i.id === itemLocal.id);
        const dataLocal = new Date(itemLocal.dataAtualizacao || itemLocal.dataCadastro || 0);
        const dataOnline = new Date(itemOnline.dataAtualizacao || itemOnline.dataCadastro || 0);
        
        if (dataLocal > dataOnline) {
          // Substituir pelo local mais recente
          const index = merged.findIndex(i => i.id === itemLocal.id);
          merged[index] = itemLocal;
        }
      }
    });

    return merged;
  }

  // Salvar dados localmente
  salvarDadosLocal(dados) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados localmente:', error);
      return false;
    }
  }

  // Obter dados locais
  getDadosLocal() {
    try {
      const dados = localStorage.getItem(STORAGE_KEY);
      return dados ? JSON.parse(dados) : null;
    } catch (error) {
      console.error('Erro ao ler dados locais:', error);
      return null;
    }
  }

  // Obter última sincronização
  getUltimaSincronizacao() {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    return lastSync ? new Date(lastSync) : null;
  }

  // Limpar dados locais
  limparDadosLocais() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
  }
}

export default new ApiService();
