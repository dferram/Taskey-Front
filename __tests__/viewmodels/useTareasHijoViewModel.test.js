import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useTareasHijoViewModel } from '../../viewmodels/useTareasHijoViewModel';
import { AuthRepository } from '../../repositories/AuthRepository';
import { TareasRepository } from '../../repositories/TareasRepository';

jest.mock('../../repositories/AuthRepository');
jest.mock('../../repositories/TareasRepository');

describe('useTareasHijoViewModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetchTareas carga las tareas del hijo autenticado', async () => {
    AuthRepository.getChildToken.mockResolvedValue('child-token');
    TareasRepository.getTareasHijo.mockResolvedValue([
      { id: 't1', title: 'Tender la cama', assignments: [{ id: 'a1', status: 'assigned' }] },
    ]);

    const { result } = await renderHook(() => useTareasHijoViewModel());

    await act(async () => {
      await result.current.fetchTareas();
    });

    expect(TareasRepository.getTareasHijo).toHaveBeenCalledWith('child-token');
    expect(result.current.tareas).toHaveLength(1);
    expect(result.current.loading).toBe(false);
  });

  it('fetchTareas setea error si no hay sesion de hijo', async () => {
    AuthRepository.getChildToken.mockResolvedValue(null);

    const { result } = await renderHook(() => useTareasHijoViewModel());

    await act(async () => {
      await result.current.fetchTareas();
    });

    expect(result.current.error).toMatch(/sesión de hijo/);
    expect(TareasRepository.getTareasHijo).not.toHaveBeenCalled();
  });

  it('cambiarEstado actualiza la asignacion correspondiente en memoria', async () => {
    AuthRepository.getChildToken.mockResolvedValue('child-token');
    TareasRepository.getTareasHijo.mockResolvedValue([
      { id: 't1', title: 'Tender la cama', assignments: [{ id: 'a1', status: 'assigned' }] },
    ]);
    TareasRepository.cambiarEstadoAsignacionHijo.mockResolvedValue({ id: 'a1', status: 'completed' });

    const { result } = await renderHook(() => useTareasHijoViewModel());

    await act(async () => {
      await result.current.fetchTareas();
    });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.cambiarEstado('a1', 'completed');
    });

    expect(actionResult.success).toBe(true);
    expect(result.current.tareas[0].assignments[0].status).toBe('completed');
  });

  it('cambiarEstado devuelve error cuando la API falla', async () => {
    AuthRepository.getChildToken.mockResolvedValue('child-token');
    TareasRepository.cambiarEstadoAsignacionHijo.mockRejectedValue(new Error('Estado inválido'));

    const { result } = await renderHook(() => useTareasHijoViewModel());

    let actionResult;
    await act(async () => {
      actionResult = await result.current.cambiarEstado('a1', 'verified');
    });

    expect(actionResult.success).toBe(false);
    expect(actionResult.error).toBe('Estado inválido');
  });
});
