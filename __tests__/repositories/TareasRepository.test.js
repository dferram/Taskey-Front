import AsyncStorage from '@react-native-async-storage/async-storage';
import { TareasRepository } from '../../repositories/TareasRepository';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('TareasRepository - lado hijo', () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('getTareasHijo guarda en cache lo que devuelve la API', async () => {
    const tareas = [{ id: 't1', title: 'Tender la cama', assignments: [{ id: 'a1', status: 'assigned' }] }];
    api.listarTareasHijo.mockResolvedValue(tareas);

    const result = await TareasRepository.getTareasHijo('child-token');

    expect(api.listarTareasHijo).toHaveBeenCalledWith('child-token');
    expect(result).toEqual(tareas);
  });

  it('getTareasHijo cae al cache local si la API falla', async () => {
    api.listarTareasHijo.mockRejectedValue(new Error('network down'));

    // Sin nada en cache previamente, debe devolver []
    const result = await TareasRepository.getTareasHijo('child-token');

    expect(result).toEqual([]);
  });

  it('cambiarEstadoAsignacionHijo delega en la API con los parametros correctos', async () => {
    api.cambiarEstadoAsignacionHijo.mockResolvedValue({ id: 'a1', status: 'completed' });

    const result = await TareasRepository.cambiarEstadoAsignacionHijo('child-token', 'a1', 'completed');

    expect(api.cambiarEstadoAsignacionHijo).toHaveBeenCalledWith('child-token', 'a1', 'completed');
    expect(result.status).toBe('completed');
  });

  it('cambiarEstadoAsignacion (padre) delega en la API con los parametros correctos', async () => {
    api.cambiarEstadoAsignacion.mockResolvedValue({ id: 'a1', status: 'verified' });

    const result = await TareasRepository.cambiarEstadoAsignacion('padre-token', 'a1', 'verified');

    expect(api.cambiarEstadoAsignacion).toHaveBeenCalledWith('padre-token', 'a1', 'verified');
    expect(result.status).toBe('verified');
  });
});
