import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

interface LoadingSpinnerProps {
  onComplete: () => void;
  words?: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  showLoadingDots?: boolean;
}

export const LoadingSpinner = ({ 
  onComplete,
  words = ['Medium'],
  typeSpeed = 200,
  deleteSpeed = 80,
  pauseDuration = 1500,
  loop = true,
  showLoadingDots = true
}: LoadingSpinnerProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when words change
  useEffect(() => {
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setIsDeleting(false);
    setDisplayText('');
    setAnimationComplete(false);
  }, [words]);

  useEffect(() => {
    const animate = () => {
      // Safety check to prevent undefined errors
      if (!words || words.length === 0) return;
      
      const currentWord = words[currentWordIndex];
      if (!currentWord) return;

      if (!isDeleting) {
        // Typing
        if (currentCharIndex < currentWord.length) {
          setDisplayText(currentWord.substring(0, currentCharIndex + 1));
          setCurrentCharIndex(prev => prev + 1);
          timeoutRef.current = setTimeout(animate, typeSpeed);
        } else {
          // Word completed
          if (words.length > 1) {
            // Multiple words - start deleting after pause
            timeoutRef.current = setTimeout(() => {
              setIsDeleting(true);
              animate();
            }, pauseDuration);
          } else if (loop) {
            // Single word with loop - restart typing
            timeoutRef.current = setTimeout(() => {
              setCurrentCharIndex(0);
              setDisplayText('');
              animate();
            }, pauseDuration);
          } else {
            // Single word without loop - animation complete
            setAnimationComplete(true);
            setTimeout(onComplete, 300);
          }
        }
      } else {
        // Deleting
        if (currentCharIndex > 0) {
          setDisplayText(currentWord.substring(0, currentCharIndex - 1));
          setCurrentCharIndex(prev => prev - 1);
          timeoutRef.current = setTimeout(animate, deleteSpeed);
        } else {
          // Word deleted, move to next word
          setIsDeleting(false);
          const nextIndex = (currentWordIndex + 1) % words.length;
          setCurrentWordIndex(nextIndex);
          timeoutRef.current = setTimeout(animate, typeSpeed);
        }
      }
    };

    if (!animationComplete) {
      animate();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [words, typeSpeed, deleteSpeed, pauseDuration, loop, currentWordIndex, currentCharIndex, isDeleting, animationComplete, onComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="text-6xl font-serif font-bold text-black tracking-wider">
        {displayText}
        <span className="animate-pulse">|</span>
      </div>
      {showLoadingDots && (
        <div className="mt-8 text-xl text-gray-600 space-x-1">
          <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>.</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.5s' }}>.</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '1s' }}>.</span>
        </div>
      )}
    </div>
  );
};

export const LoadingPage = () => {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/");
  };

  return (
    <div className="absolute top-0 right-0 w-screen h-screen flex justify-center items-center bg-[#f7f4ed]">
      <LoadingSpinner 
        onComplete={handleComplete}
        words={['Medium']}
        typeSpeed={500}
        loop={true}
        // showLoadingDots={true}
      />
    </div>
  );
};

// Alternative version with multiple words and looping
export const LoadingPageWithLoop = () => {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/");
  };

  return (
    <div className="absolute top-0 right-0 w-screen h-screen flex justify-center items-center bg-[#f7f4ed]">
      <LoadingSpinner 
        onComplete={handleComplete}
        words={['Medium']}
        typeSpeed={120}
        deleteSpeed={80}
        pauseDuration={1500}
        loop={true}
        showLoadingDots={true}
      />
    </div>
  );
};

export const LoadingSpinnerLOAD = (props: {size?: number}) => {

    return (<div role="status">
    <svg aria-hidden="true" className="text-slate-200 animate-spin dark:text-slate-600 fill-pink-600"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width={props.size ?? 16}
    height={props.size ?? 16  }>
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span className="sr-only">Loading...</span>
</div>)
};