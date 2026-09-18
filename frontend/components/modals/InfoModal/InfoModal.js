"use client";

import { Text } from "@via-ds/components/typography";
import modal from "../Modal.module.css";

const CONTENT = {
  search: {
    title: "✨ MongoDB Atlas Search",
    body: (
      <>
        <p>
          This search bar runs on MongoDB Atlas Search — full-text search built
          directly on top of the same database as the product catalog, so
          there&apos;s no separate search cluster to keep in sync.
        </p>
        <ul>
          <li>
            Relevance ranking, typo tolerance, and faceted filtering run
            natively against live product documents.
          </li>
          <li>
            The same index can power autocomplete, merchandising rules, and the
            recommendations on this page.
          </li>
          <li>
            Because it reads the live collection, a new or updated product is
            searchable the moment it&apos;s saved.
          </li>
        </ul>
        <p style={{ marginTop: 16 }}>
          Customer story:{" "}
          <a
            href="https://www.mongodb.com/customers/albertsons"
            target="_blank"
            rel="noopener noreferrer"
          >
            MongoDB Atlas Search powers the Albertsons Promotions Engine →
          </a>
        </p>
      </>
    ),
  },
  recs: {
    title: "How Atlas personalizes this screen",
    body: (
      <>
        <p>
          These recommendations are meant to represent a live query over
          customer context and product data, not a static block curated offline.
        </p>
        <ul>
          <li>
            Customer interests, purchase history, and current tier can be read
            directly from the profile document that also holds loyalty state.
          </li>
          <li>
            Atlas Search and Vector Search can blend relevance, semantic
            similarity, and merchandising rules against the live product
            catalog.
          </li>
          <li>
            When the customer profile changes after a purchase or redemption,
            the next recommendation query can reflect that latest write
            immediately.
          </li>
        </ul>
      </>
    ),
  },
  facets: {
    title: "How Atlas Search facets shape discovery",
    body: (
      <>
        <p>
          The category explorer is the stand-in for Atlas Search facets: filters
          and counts returned from the same live catalog used for relevance.
        </p>
        <ul>
          <li>
            Facet-style grouping keeps category discovery tied to the current
            catalog, rather than a disconnected merchandising index.
          </li>
          <li>
            As catalog content, campaign logic, or audience targeting changes,
            the available exploration paths can update from the same underlying
            search workflow.
          </li>
          <li>
            This lets the demo connect recommendations, search, and category
            exploration back to one Atlas-driven discovery experience.
          </li>
        </ul>
      </>
    ),
  },
};

export default function InfoModal({ onClose, variant }) {
  const content = CONTENT[variant];
  return (
    <>
      <div className={modal.head}>
        <Text as="h2">{content.title}</Text>
        <button className={modal.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={modal.body}>{content.body}</div>
    </>
  );
}
