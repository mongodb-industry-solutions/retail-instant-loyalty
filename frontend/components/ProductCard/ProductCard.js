import { Skeleton } from "@via-ds/components/skeleton";
import { Card } from "@via-ds/components/card";
import { Text } from "@via-ds/components";
import { useDispatch } from "react-redux";
import Image from "next/image";
import styles from "./ProductCard.module.css";
import { formatPrice } from "@/lib/helper";
import { Button } from "@via-ds/components/button";
import { addToCart, openModal } from "@/redux/slices/GlobalSlice";

export function ProductCardSkeleton() {
  return <Skeleton className={styles.productCard} />;
}

export default function ProductCard({ product }) {
  //style={{ objectFit: "contain" }}
  const photo = product.imageURL || "/images/placeholder.png"; // Use placeholder if imageURL is not available
  const dispatch = useDispatch();
  function openDetail() {
    dispatch(
      openModal({
        modalType: "productDetail",
        props: { id: product.productId },
      }),
    );
  }

  return (
    <Card
      className={styles.productCard}
      onClick={openDetail}
      style={{ cursor: "pointer" }}
    >
      <div
        className={styles.pThumb}
        style={{ background: "rgba(239, 239, 239, 0.99)" }}
      >
        <Image
          src={photo}
          alt={product.name}
          fill
          unoptimized
          loading="eager" // Eager on purpose: silences Next's LCP "add loading=eager" dev warning.
          className={styles.pThumbImg}
        />
        {/* {<span className={styles.pBadge}>{"Best Seller"}</span>} */}
      </div>
      <div className={styles.pBodyText}>
        <div className={styles.pCat}>
          <Text elementType="span">{product.category}</Text>
        </div>
        <div className={styles.pName}>
          <Text>{product.name}</Text>
        </div>
        <div className={styles.pRating}>
          <Text elementType="span" className={styles.star}>
            {product.rating.toFixed(1)} ★
          </Text>{" "}
          {product.reviews.length} reviews
        </div>
      </div>

      <div className={styles.pFoot}>
        <div className={styles.pPriceWrap}>
          <div className={styles.pPrice}>
            <Text textStyle="heading5">
              {formatPrice(parseFloat(product.price.$numberDecimal))}
            </Text>
            {/* {<span className={styles.pWas}>{formatPrice(product.price)}</span>} */}
          </div>
        </div>
        <Button
          variant="primary"
          size="xsmall"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(addToCart(product.productId));
          }}
        >
          + Add
        </Button>
      </div>
    </Card>
  );
}
