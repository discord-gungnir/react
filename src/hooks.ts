import type { Guild, GuildMember, PartialGuildMember, User, PartialUser, DMChannel, GuildChannel, Channel, Message } from "discord.js";
import { useCallback, useEffect, useState, useRef } from "react";
import type { EffectCallback, DependencyList } from "react";
import { RenderResult, CURRENT_RENDER } from "./render";

// internal

function useRenderResult() {
  return useRef(RenderResult[CURRENT_RENDER]).current as RenderResult;
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
  }, deps);
}

/**
 * Hook that rerenders the component when the guild is updated
 * @param guild The guild to track
 * @param duration For how long to track updates, defaults to 5 minutes
 */
export function useGuild(guild: Guild, duration = 300000) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: Guild) => {
      if (old.id == guild.id) forceUpdate()};
    guild.client.on("guildUpdate", event);
    return () => void guild.client.off("guildUpdate", event);
  }, [guild.id]);
}

/**
 * Hook that rerenders the component when the guild member is updated
 * @param member The guild member to track
 * @param duration For how long to track updates, defaults to 5 minutes
 */
export function useGuildMember(member: GuildMember, duration = 300000) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: GuildMember | PartialGuildMember) => {
      if (old.id == member.id) forceUpdate()};
    member.client.on("guildMemberUpdate", event);
    return () => void member.client.off("guildMemberUpdate", event);
  }, [member.id]);
}

/**
 * Hook that rerenders the component when the user is updated
 * @param user The user to track
 * @param duration For how long to track updates, defaults to 5 minutes
 */
export function useUser(user: User, duration = 300000) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: User | PartialUser) => {
      if (old.id == user.id) forceUpdate()};
    user.client.on("userUpdate", event);
    return () => void user.client.off("userUpdate", event);
  }, [user.id]);
}

/**
 * Hook that rerenders the component when the channel is updated
 * @param channel The channel to track
 * @param duration For how long to track updates, defaults to 5 minutes
 */
 export function useChannel(channel: DMChannel | GuildChannel, duration = 300000) {
  const forceUpdate = useForceUpdate();
  useTemporaryEffect(duration, () => {
    const event = (old: Channel) => {
      if (old.id == channel.id) forceUpdate()};
    channel.client.on("channelUpdate", event);
    return () => void channel.client.off("channelUpdate", event);
  }, [channel.id]);
}

/**
 * Hook that rerenders the component once the message has been posted
 */
export function useThisMessage(): Message | null {
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