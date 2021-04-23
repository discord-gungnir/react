import { Node, AuthorNode, DescriptionNode, EmbedNode, FieldNode, FieldNameNode, FieldValueNode, FileNode, FooterNode, MessageNode, ImageNode, ReactionNode,
  TextNode, ThumbnailNode, TimestampNode, TitleNode, ParentNode, ROOT_CLONE } from "./nodes";
import { RenderResult, TRIGGER_CHANGE } from "./render";
import ReactReconciler from "react-reconciler";
import { GungnirError } from "@gungnir/core";
import type { RootNode } from "./nodes";

export default ReactReconciler<
  string,
  Record<string, any>,
  RenderResult,
  Node,
  TextNode,
  Node,
  Node,
  Node,
  null,
  Record<string, any>,
  unknown,
  number,
  -1
>({
  // options
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: true,

  // proxies
  now: Date.now,
  queueMicrotask,
  
  // timeout
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  // create
  createInstance(type, props) {
    switch(type) {
      case "gungnir-author":
        return new AuthorNode(props.iconURL, props.url);
      case "gungnir-description":
        return new DescriptionNode();
      case "gungnir-embed":
        return new EmbedNode(props.color);
      case "gungnir-field":
        return new FieldNode(props.inline);
      case "gungnir-field-name":
        return new FieldNameNode();
      case "gungnir-field-value":
        return new FieldValueNode();
      case "gungnir-file":
        return new FileNode(props.file);
      case "gungnir-footer":
        return new FooterNode(props.iconURL);
      case "gungnir-message":
        return new MessageNode();
      case "gungnir-image":
        return new ImageNode(props.url);
      case "gungnir-reaction":
        return new ReactionNode(props.emoji);
      case "gungnir-thumbnail":
        return new ThumbnailNode(props.url);
      case "gungnir-timestamp":
        return new TimestampNode(props.time);
      case "gungnir-title":
        return new TitleNode(props.url);
      default:
        throw new GungnirError(`'${type}' is not a valid element type`);
    }
  },
  createTextInstance(text) {
    return new TextNode(text);
  },
  shouldSetTextContent() {
    return false;
  },

  // update
  prepareUpdate(instance, type, oldProps, newProps) {
    const diff: Record<string, any> = {};
    let hasDiff = false;
    for (const key in oldProps) {
      if (key == "children") continue;
      if (!Object.is(oldProps[key], newProps[key])) {
        diff[key] = newProps[key];
        hasDiff = true;
      }
    }
    for (const key in newProps) {
      if (key == "children" || key in diff) continue;
      if (!Object.is(oldProps[key], newProps[key])) {
        diff[key] = newProps[key];
        hasDiff = true;
      }
    }
    return hasDiff ? diff : null;
  },
  commitUpdate(instance, update) {
    Object.assign(instance, update)
  },
  commitTextUpdate(instance, oldText, newText) {
    instance.text = newText;
  },

  // children
  appendInitialChild(parent, child) {
    if (!(parent instanceof ParentNode))
      throw new GungnirError(`elements of type '${parent.type}' can't have children`);
    if (!parent.isValidChild(child))
      throw new GungnirError(`'${child.type}' is not a valid ${parent.type} child`);
    parent.appendChild(child as any);
  },
  appendChild(parent, child) {
    if (!(parent instanceof ParentNode))
      throw new GungnirError(`elements of type '${parent.type}' can't have children`);
    if (!parent.isValidChild(child))
      throw new GungnirError(`'${child.type}' is not a valid ${parent.type} child`);
    parent.appendChild(child as any);
  },
  insertBefore(parent, child, before) {
    if (!(parent instanceof ParentNode))
      throw new GungnirError(`elements of type '${parent.type}' can't have children`);
    if (!parent.isValidChild(child))
      throw new GungnirError(`'${child.type}' is not a valid ${parent.type} child`);
    parent.prependChild(child as any, before as any);
  },
  removeChild(parent, child) {
    if (!(parent instanceof ParentNode))
      throw new GungnirError(`elements of type '${parent.type}' can't have children`);
    if (!parent.isValidChild(child))
      throw new GungnirError(`'${child.type}' is not a valid ${parent.type} child`);
    parent.removeChild(child as any);
  },

  // container
  appendChildToContainer(render, child) {
    if (!render.root.isValidChild(child))
      throw new GungnirError(`'${child.type}' is not a valid root child`);
    render.root.appendChild(child);
  },
  insertInContainerBefore(render, child, before) {
    if (!render.root.isValidChild(child) || !render.root.isValidChild(before))
      throw new GungnirError(`'${child.type}' is not a valid root child`);
    render.root.prependChild(child, before);
  },
  removeChildFromContainer(render, child) {
    if (!render.root.isValidChild(child))
      throw new GungnirError(`'${child.type}' is not a valid root child`);
    render.root.removeChild(child);
  },
  clearContainer(render) {
    render.root.removeAllChildren();
  },

  // commit
  prepareForCommit(render) {
    render.root[ROOT_CLONE] = render.root.clone();
    return null;
  },
  resetAfterCommit(render) {
    if (!render.root.equals(render.root[ROOT_CLONE] as RootNode))
      render[TRIGGER_CHANGE]();
    render.root[ROOT_CLONE] = null;
  },
  
  // context
  getRootHostContext(render) {
    RenderResult.current = render;
    return null;
  },
  getChildHostContext(context) {
    return context;
  },
  getPublicInstance(instance) {
    return instance;
  },
  
  // misc
  preparePortalMount(render) {},
  hideInstance(instance) {},
  unhideInstance(instance) {},
  finalizeInitialChildren(instance) {
    return false;
  }
});
