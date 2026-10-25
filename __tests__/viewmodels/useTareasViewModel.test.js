import { renderHook, act } from '@testing-library/react-native';
import { useTareasViewModel } from '../../viewmodels/useTareasViewModel';
import { AuthRepository } from '../../repositories/AuthRepository';
import { TareasRepository } from '../../repositories/TareasRepository';

jest.mock('../../repositories/AuthRepository');
jest.mock('../../repositories/TareasRepository');

describe('useTareasViewModel - cambiarEstadoAsignacion (padre)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('verifica una asignacion y actualiza el estado en memoria', async () => {
    AuthRepository.getParentToken.mockResolvedValue('padre-token');
    TareasRepository.getTareas.mockResolvedValue([
      { id: 't1', title: 'Tender la cama', assignments: [{ id: 'a1', status: 'completed' }] },
    ]);
    TareasRepository.cambiarEstadoAsignacion.mockResolvedValue({ id: 'a1', status: 'verified' });

    const { result } = await renderHook(() => useTareasViewModel());

    await act(async () => {
      await result.current.fetchTareas();
    });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.cambiarEstadoAsignacion('a1', 'verified');
    });

    expect(TareasRepository.cambiarEstadoAsignacion).toHaveBeenCalledWith('padre-token', 'a1', 'verified');
    expect(actionResult.success).toBe(true);
    expect(result.current.tareas[0].assignments[0].status).toBe('verified');
  });

  it('devuelve error si no hay token de padre', async () => {
    AuthRepository.getParentToken.mockResolvedValue(null);

    const { result } = await renderHook(() => useTareasViewModel());

    let actionResult;
    await act(async () => {
      actionResult = await result.current.cambiarEstadoAsignacion('a1', 'verified');
    });

    expect(actionResult.success).toBe(false);
    expect(TareasRepository.cambiarEstadoAsignacion).not.toHaveBeenCalled();
  });
});
