/**
 * The mock player is the same clock player the real engine uses — re-exported
 * under the M0.10 names so existing mock-driven code keeps working. The real
 * implementation lives in `../engine/create-player.js`.
 */
export {
  TimelinePlayer as MockPlayer,
  createPlayer as createMockPlayer,
  type PlayerOptions as MockPlayerOptions,
} from "../engine/create-player.js";
