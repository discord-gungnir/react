import type { Guild, GuildMember, PartialGuildMember, User, PartialUser, Channel, Message, PartialMessage } from "discord.js";
import { useCallback, useEffect, useState, useRef } from "react";
import type { EffectCallback, DependencyList } from "react";
import { RenderResult } from "./render";

// internal

function useRenderResult() {
  return useRef(RenderResult.current as RenderResult).current;
}

// exported

export function useTimeout(handler: TimerHandler, timeout?: number, deps?: DependencyList) {
  return useEffect(() => {
    const handle = setTimeout(handler, timeout);
    return () => clearTimeout(handle);
  }, deps);
}

export function useInterval(handler: TimerHandler, timeout?: number, deps?: DependencyList) {
  return useEffect(() => {
    const handle = setInterval(handler, timeout);
    return () => clearInterval(handle);
  }, deps);
}

export function useForceUpdate() {
  const setValue = useState({})[1];
  return useCallback(() => setValue({}), []);
}

export function useTemporaryEffect(duration: number, effect: EffectCallback, deps?: DependencyList) {
  return useEffect(() => {
    if (duration < 0) return effect();
    else {
      let destroyed = false;
      const destroy = effect();
      function disable() {
        if (!destroy || destroyed) return;
        destroyed = true;
        destroy();
      }
      const timeout = setTimeout(disable, duration);
      return () => {
        clearTimeout(timeout);
        disable();
      }
    }
  }, deps);
}

/**
 * Returns the client
 */
export function useClient() {
  return useRenderResult().client;
}

/**
 * Returns the channel where the message is posted
 */
export function useChannel() {
  return useRenderResult().channel;
}

/**
 * Returns the guild where the message is posted
 */
export function useGuild() {
  const channel = useChannel();
  return channel.type == "dm" ? null : channel.guild;
}

/**
 * Rerenders the component once the message has been posted
 */
export function useMessage() {
  const render = useRenderResult();
  const [message, setMessage] = useState<Message | null>(render.message);
  useEffect(() => {
    if (message) return;
    let destroyed = false;
    render.awaitMessage().then(msg => {
      if (!destroyed) setMessage(msg)});
    return () => void (destroyed = true);
  }, []);
  return message;
}

/**
 * Rerenders the component when the user is updated
 * @param user The user to track
 * @param duration For how long to track updates
 */
 export function useTrackUser(user: User, duration = -1) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: User | PartialUser) => {
      if (old.id == user.id) forceUpdate()};
    user.client.on("userUpdate", event);
    return () => void user.client.off("userUpdate", event);
  }, [user.id]);
  return user;
}

/**
 * Rerenders the component when the guild is updated
 * @param guild The guild to track
 * @param duration For how long to track updates
 */
export function useTrackGuild(guild: Guild, duration = -1) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: Guild) => {
      if (old.id == guild.id) forceUpdate()};
    guild.client.on("guildUpdate", event);
    return () => void guild.client.off("guildUpdate", event);
  }, [guild.id]);
  return guild;
}

/**
 * Rerenders the component when the guild member is updated
 * @param member The guild member to track
 * @param duration For how long to track updates
 */
export function useTrackGuildMember(member: GuildMember, duration = -1) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: GuildMember | PartialGuildMember) => {
      if (old.id == member.id) forceUpdate()};
    member.client.on("guildMemberUpdate", event);
    return () => void member.client.off("guildMemberUpdate", event);
  }, [member.id]);
  return member;
}

/**
 * Rerenders the component when the channel is updated
 * @param channel The channel to track
 * @param duration For how long to track updates
 */
 export function useTrackChannel<T extends Channel>(channel: T, duration = -1) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: Channel) => {
      if (old.id == channel.id) forceUpdate()};
    channel.client.on("channelUpdate", event);
    return () => void channel.client.off("channelUpdate", event);
  }, [channel.id]);
  return channel;
}

/**
 * Rerenders the component when the message is updated
 * @param message The message to track
 * @param duration For how long to track updates
 */
export function useTrackMessage(message: Message, duration = -1) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: Message | PartialMessage) => {
      if (old.id == message.id) forceUpdate()};
    message.client.on("messageUpdate", event);
    return () => void message.client.off("messageUpdate", event);
  }, [message.id]);
  return message;
}