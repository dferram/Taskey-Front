import { render, screen, fireEvent, act } from '@testing-library/react-native';
import NotificacionesHijo from '../../app/(child)/notificacioneshijo';
import { useNotificacionesViewModel } from '../../viewmodels/useNotificacionesViewModel';
import { router, __resetMocks } from 'expo-router';

jest.mock('../../viewmodels/useNotificacionesViewModel');

describe('<NotificacionesHijo />', () => {
  beforeEach(() => {
    __resetMocks();
  });

  it('muestra las notificaciones reales del backend, no la lista de ejemplo', async () => {
    useNotificacionesViewModel.mockReturnValue({
      notificaciones: [
        {
          id: 'n1',
          tipo: 'TAREA_CONFIRMADA',
          titulo: '¡Misión confirmada!',
          mensaje: 'Tu padre confirmó que completaste tu misión. ¡Buen trabajo!',
          leida: false,
          fecha_creacion: new Date().toISOString(),
        },
      ],
      loading: false,
      fetchNotificaciones: jest.fn(),
      marcarLeidas: jest.fn(),
    });

    await render(<NotificacionesHijo />);

    expect(screen.getByText(/Tu padre confirmó/)).toBeTruthy();
    expect(screen.queryByText(/Nueva misión asignada/)).toBeNull();
  });

  it('muestra un mensaje vacio cuando no hay notificaciones', async () => {
    useNotificacionesViewModel.mockReturnValue({
      notificaciones: [],
      loading: false,
      fetchNotificaciones: jest.fn(),
      marcarLeidas: jest.fn(),
    });

    await render(<NotificacionesHijo />);

    expect(screen.getByText('No tienes notificaciones todavía')).toBeTruthy();
  });

  it('marca como leida y navega al tocar una notificacion de mision confirmada', async () => {
    const marcarLeidas = jest.fn();
    useNotificacionesViewModel.mockReturnValue({
      notificaciones: [
        {
          id: 'n1',
          tipo: 'TAREA_CONFIRMADA',
          titulo: 'Confirmada',
          mensaje: 'Mensaje de prueba',
          leida: false,
          fecha_creacion: new Date().toISOString(),
        },
      ],
      loading: false,
      fetchNotificaciones: jest.fn(),
      marcarLeidas,
    });

    await render(<NotificacionesHijo />);

    await act(async () => {
      await fireEvent.press(screen.getByText('Mensaje de prueba'));
    });

    expect(marcarLeidas).toHaveBeenCalledWith(['n1']);
    expect(router.push).toHaveBeenCalledWith('/tareashijo');
  });
});
