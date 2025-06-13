// import FlyingButton from 'react-flying-item'
import {motion} from 'framer-motion';

export default function AddToCartButton({
  hasSizesOrExtras, onClick, basePrice, image
}) {
  if (!hasSizesOrExtras) {
    return (
      <div className="flying-button-parent mt-4">
        {/* <FlyingButton
          targetTop={'5%'}
          targetLeft={'95%'}
          src={image}>
          <div onClick={onClick}>
            Add to cart ${basePrice}
          </div>
        </FlyingButton> */}
        <motion.button
          type="button"
          onClick={onClick}
          className="bg-primary text-white rounded-full px-8 py-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Add to cart (from ${basePrice})</span>  
        </motion.button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 bg-primary text-white rounded-full px-8 py-2"
    >
      <span>Add to cart (from ${basePrice})</span>
    </button>
  );
}