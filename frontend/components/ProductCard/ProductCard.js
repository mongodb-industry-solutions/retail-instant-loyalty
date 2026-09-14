import { Skeleton } from "@via-ds/components/skeleton";
import { Card } from "@via-ds/components/card";
import { useDispatch } from "react-redux";
import Image from "next/image";
import styles from "./ProductCard.module.css";
import { formatPrice } from "../../lib/helper";
import { Button } from "@via-ds/components/button";
import { addToCart } from "@/redux/slices/GlobalSlice";

export function ProductCardSkeleton() {
  return <Skeleton className={styles.productCard} />;
}

export default function ProductCard({ product }) {
  //style={{ objectFit: "contain" }}
  const photo = product.imageURL || "/images/placeholder.png"; // Use placeholder if imageURL is not available
  const dispatch = useDispatch();
  console.log("photo in ProductCard.js:", photo);
  console.log("product in ProductCard.js:", product);
  return (
    <Card className={styles.productCard}>
      <div
        className={styles.pThumb}
        style={{ background: "rgba(239, 239, 239, 0.99)" }}
      >
        <Image
          src={photo}
          alt={product.name}
          fill
          unoptimized
          className={styles.pThumbImg}
        />
        {<span className={styles.pBadge}>{"Best Seller"}</span>}
      </div>
      <div className={styles.pBodyText}>
        <div className={styles.pCat}>{product.category}</div>
        <div className={styles.pName}>{product.name}</div>
        <div className={styles.pRating}>
          <span className={styles.star}>{5} ★</span> {product.reviews.length}{" "}
          reviews
        </div>
      </div>
      <div className={styles.pFoot}>
        <div className={styles.pPriceWrap}>
          <div className={styles.pPrice}>
            {formatPrice(product.price)}
            {/* {<span className={styles.pWas}>{formatPrice(product.price)}</span>} */}
          </div>
        </div>
        <Button
          variant="primary"
          size="xsmall"
          onClick={() => dispatch(addToCart(product.productId))}
        >
          + Add
        </Button>
      </div>
    </Card>
  );
}
