"use client";

let nextContentId = 0;
const contentById = new Map();

export function registerFreestyleContent(content) {
  const contentId = `freestyle-${++nextContentId}`;
  contentById.set(contentId, content);
  return contentId;
}

export function getFreestyleContent(contentId) {
  return contentById.get(contentId) ?? null;
}

export function removeFreestyleContent(contentId) {
  contentById.delete(contentId);
}