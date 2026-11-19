import { useLocation } from 'react-router-dom';
// pages are reused inside the player dashboard, so links need a "/player" prefix there
export default function useBase() {
  return useLocation().pathname.startsWith('/player') ? '/player' : '';
}
