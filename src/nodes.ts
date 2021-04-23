import type { ColorResolvable, EmojiIdentifierResolvable, FileOptions, MessageAttachment } from "discord.js";
import { MessageEmbed } from "discord.js";
import type { Props } from "./types";

// base node

export abstract class BaseNode<T extends string> {
  public constructor(public readonly type: T) {}
  public abstract equals(node: Node): boolean;
  public abstract clone(): BaseNode<T>;
}

export abstract class ParentNode<T extends string, C extends Node = Node> extends BaseNode<T> {
  public abstract isValidChild(node: Node): node is C;

  // util
  public equals(node: Node) {
    if (!(node instanceof ParentNode)) return false;
    if (this.children.length != node.children.length) return false;
    for (let i = 0; i < this.children.length; i++) {
      const child1 = this.children[i] as Node;
      const child2 = node.children[i] as Node;
      if (!child1.equals(child2)) return false;
    }
    return true;
  }

  // children
  public children: C[] = [];
  public appendChild(child: C, after?: C) {
    if (!after) this.children.push(child);
    else {
      const index = this.children.findIndex(c => c == after);
      if (index != -1) this.children.splice(index+1, 0, child);
    }
  }
  public prependChild(child: C, before?: C) {
    if (!before) this.children.unshift(child);
    else {
      const index = this.children.findIndex(c => c == before);
      if (index != -1) this.children.splice(index, 0, child);
    }
  }
  public removeChild(child: C) {
    this.children = this.children.filter(c => c != child);
  }
  public removeAllChildren() {
    this.children.length = 0;
  }
}

export abstract class TextBasedNode<T extends string> extends ParentNode<T, TextNode> {
  public isValidChild(node: Node): node is TextNode {
    return node.type == "text";
  }

  // util
  public equals(node: Node) {
    return node instanceof TextBasedNode
    && this.text == node.text;
  }

  // text
  public get text() {
    return this.children.map(c => c.text).join("");
  }
  public set text(text) {
    this.removeAllChildren();
    this.appendChild(new TextNode(text));
  }
}

// nodes

export class AuthorNode extends TextBasedNode<"author"> implements Props<"author"> {
  public constructor(public iconURL?: string, public url?: string) {
    super("author");
  }

  // util
  public equals(node: Node) {
    return node instanceof AuthorNode
    && this.text == node.text
    && this.iconURL === node.iconURL
    && this.url === node.url;
  }
  public clone() {
    const clone = new AuthorNode(this.iconURL, this.url);
    clone.children = this.children.map(c => c.clone());
    return clone;
  }
}

export class DescriptionNode extends TextBasedNode<"description"> implements Props<"description"> {
  public constructor() {super("description")}

  // util
  public equals(node: Node) {
    return node instanceof DescriptionNode
    && this.text == node.text;
  }
  public clone() {
    const clone = new DescriptionNode();
    clone.children = this.children.map(c => c.clone());
    return clone;
  }
}

const EMBED_CHILDREN = ["author", "description", "embed", "field", "file", "footer", "image", "thumbnail", "timestamp", "title"] as const;
export class EmbedNode extends ParentNode<"embed", EmbedChildren> implements Props<"embed"> {
  public constructor(public color?: ColorResolvable) {super("embed")}
  public isValidChild(node: Node): node is EmbedChildren {
    return (EMBED_CHILDREN as readonly string[]).includes(node.type);
  }

  // util
  public equals(node: Node) {
    return node instanceof EmbedNode
    && this.color === node.color
    && super.equals(node);
  }
  public clone() {
    const clone = new EmbedNode(this.color);
    clone.children = this.children.map(c => c.clone());
    return clone;
  }

  // create embed
  public createEmbed() {
    const embed = new MessageEmbed();
    const files: Parameters<MessageEmbed["attachFiles"]>[0] = [];
    void function handleNode(node: EmbedChildren) {
      switch(node.type) {
        case "author":
          embed.setAuthor(node.text, node.iconURL, node.url);
          break;
        case "description":
          embed.setDescription(node.text);
          break;
        case "embed":
          for (const child of node.children)
            handleNode(child);
          if (node.color !== undefined)
            embed.setColor(node.color);
          break;
        case "field":
          embed.addField(node.name, node.value, node.inline);
          break;
        case "file":
          files.push(node.file);
          break;
        case "footer":
          embed.setFooter(node.text, node.iconURL);
          break;
        case "image":
          embed.setImage(node.url);
          break;
        case "thumbnail":
          embed.setThumbnail(node.url);
          break;
        case "timestamp":
          embed.setTimestamp(node.time);
          break;
        case "title":
          embed.setTitle(node.text);
          embed.setURL(node.url ?? "");
      }
    }(this);
    embed.attachFiles(files);
    return embed;
  }
}

export class FieldNode extends ParentNode<"field", FieldNameNode | FieldValueNode> implements Props<"field"> {
  public constructor(public inline: boolean = false) {super("field")}
  public isValidChild(node: Node): node is FieldNameNode | FieldValueNode {
    return node.type == "field-name" || node.type == "field-value";
  }

  // util
  public equals(node: Node) {
    return node instanceof FieldNode
    && this.name == node.name
    && this.value == node.value
    && this.inline == node.inline;
  }
  public clone() {
    const clone = new FieldNode(this.inline);
    clone.children = this.children.map(c => c.clone());
    return clone;
  }

  // name
  private get nameNode() {
    const name = this.children[0];
    return name?.type == "field-name" ? name : null;
  }
  public get name() {
    return this.nameNode?.text ?? "";
  }
  public set name(name) {
    if (this.nameNode) this.nameNode.text = name;
  }
  
  // value
  private get valueNode() {
    const value = this.children[1];
    return value?.type == "field-value" ? value : null;
  }
  public get value() {
    return this.valueNode?.text ?? "";
  }
  public set value(value) {
    if (this.valueNode) this.valueNode.text = value;
  }
}

export class FieldNameNode extends TextBasedNode<"field-name"> implements Props<"field-name"> {
  public constructor() {super("field-name")}

  public equals(node: Node) {
    return node instanceof FieldNameNode
    && this.text == node.text;
  }

  public clone() {
    const clone = new FieldNameNode();
    clone.children = this.children.map(c => c.clone());
    return clone;
  }
}

export class FieldValueNode extends TextBasedNode<"field-value"> implements Props<"field-value"> {
  public constructor() {super("field-value")}

  public equals(node: Node) {
    return node instanceof FieldValueNode
    && this.text == node.text;
  }

  public clone() {
    const clone = new FieldValueNode();
    clone.children = this.children.map(c => c.clone());
    return clone;
  }
}

export class FileNode extends BaseNode<"file"> implements Props<"file"> {
  public constructor(public file: string | FileOptions | MessageAttachment) {super("file")}

  public equals(node: Node) {
    return node instanceof FileNode
    && this.file == node.file;
  }

  public clone() {
    return new FileNode(this.file);
  }
}

export class FooterNode extends TextBasedNode<"footer"> implements Props<"footer"> {
  public constructor(public iconURL?: string) {super("footer")}

  public equals(node: Node) {
    return node instanceof FooterNode
    && this.text == node.text
    && this.iconURL === node.iconURL;
  }

  public clone() {
    const clone = new FooterNode(this.iconURL);
    clone.children = this.children.map(c => c.clone());
    return clone;
  }
}

export class MessageNode extends TextBasedNode<"message"> implements Props<"message"> {
  public constructor() {super("message")}

  public equals(node: Node) {
    return node instanceof MessageNode
    && this.text == node.text;
  }

  public clone() {
    const clone = new MessageNode();
    clone.children = this.children.map(c => c.clone());
    return clone;
  }
}

export class ImageNode extends BaseNode<"image"> implements Props<"image"> {
  public constructor(public url: string) {super("image")}

  // util
  public equals(node: Node) {
    return node instanceof ImageNode
    && this.url == node.url;
  }
  public clone() {
    return new ImageNode(this.url);
  }
}

export class ReactionNode extends BaseNode<"reaction"> implements Props<"reaction"> {
  public constructor(public emoji: EmojiIdentifierResolvable) {super("reaction")}

  // util
  public equals(node: Node) {
    return node instanceof ReactionNode
    && this.emoji == node.emoji;
  }
  public clone() {
    return new ReactionNode(this.emoji);
  }
}

export const ROOT_CLONE = Symbol("root clone");
export class RootNode extends ParentNode<"root", EmbedNode | MessageNode | ReactionNode> {
  private [ROOT_CLONE]: RootNode | null = null;
  public constructor() {
    super("root");
    Object.defineProperty(this, ROOT_CLONE, {enumerable: false});
  } 

  // children
  public isValidChild(node: Node): node is EmbedNode | MessageNode | ReactionNode {
    return node.type == "embed"
    || node.type == "message"
    || node.type == "reaction";
  }
  public get embeds() {
    return this.children.filter(c => c.type == "embed") as EmbedNode[];
  }
  public get messages() {
    return this.children.filter(c => c.type == "message") as MessageNode[];
  }
  public get reactions() {
    return this.children.filter(c => c.type == "reaction") as ReactionNode[];
  }

  // util
  public equals(node: Node) {
    return super.equals(node)
    && node instanceof RootNode;
  }
  public clone() {
    const clone = new RootNode();
    clone.children = this.children.map(c => c.clone());
    return clone;
  }
}

export class TextNode extends BaseNode<"text"> {
  public constructor(public text: string) {super("text")}

  public equals(node: Node) {
    return node instanceof TextNode
    && this.text == node.text;
  }

  public clone() {
    return new TextNode(this.text);
  }
}

export class ThumbnailNode extends BaseNode<"thumbnail"> implements Props<"thumbnail"> {
  public constructor(public url: string) {super("thumbnail")}

  public equals(node: Node) {
    return node instanceof ThumbnailNode
    && this.url == node.url;
  }

  public clone() {
    return new ThumbnailNode(this.url);
  }
}

export class TimestampNode extends BaseNode<"timestamp"> implements Props<"timestamp"> {
  public constructor(public time: number | Date = Date.now()) {super("timestamp")}

  public equals(node: Node) {
    if (!(node instanceof TimestampNode)) return false;
    const timestamp1 = typeof this.time == "number" ? this.time : this.time.getTime();
    const timestamp2 = typeof node.time == "number" ? node.time : node.time.getTime();
    return timestamp1 == timestamp2;
  }

  public clone() {
    return new TimestampNode(this.time);
  }
}

export class TitleNode extends TextBasedNode<"title"> implements Props<"title"> {
  public constructor(public url?: string) {super("title")}

  public equals(node: Node) {
    return node instanceof TitleNode
    && this.text == node.text
    && this.url === node.url;
  }

  public clone() {
    const clone = new TitleNode(this.url);
    clone.children = this.children.map(c => c.clone());
    return clone;
  }
}

export type Node =
  AuthorNode
  | DescriptionNode
  | EmbedNode
  | FieldNode
  | FieldNameNode
  | FieldValueNode
  | FileNode
  | FooterNode
  | MessageNode
  | ImageNode
  | ReactionNode
  | RootNode
  | TextNode
  | ThumbnailNode
  | TimestampNode
  | TitleNode;

export type EmbedChildren =
  AuthorNode
  | DescriptionNode
  | EmbedNode
  | FieldNode
  | FileNode
  | FooterNode
  | ImageNode
  | ThumbnailNode
  | TimestampNode
  | TitleNode;