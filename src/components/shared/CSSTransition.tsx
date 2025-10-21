import { cloneElement, JSX, useEffect, useState } from 'react';

interface ReactCSSTransitionProps {
  timeout: number;
  children: JSX.Element;
  state: boolean;
  classNames: {
    exitActive: string;
  };
}

const ReactCSSTransition = (props: ReactCSSTransitionProps) => {
  const [state, setState] = useState<boolean>(props.state);
  const [animationClass, setAnimationClass] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(props.state);
  const [firstRender, setFirstRender] = useState<boolean>(true);

  useEffect(() => {
    setState(props.state);
  }, [props.state]);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    let anim_request: number;
    let timeout: NodeJS.Timeout;
    if (state) {
      setMounted(true);
      setAnimationClass(props.classNames.exitActive);

      anim_request = requestAnimationFrame(() => {
        anim_request = requestAnimationFrame(() => {
          setAnimationClass('');
        });
      });
    } else {
      setAnimationClass(props.classNames.exitActive);
      timeout = setTimeout(() => {
        setMounted(false);
      }, props.timeout);
    }

    return () => {
      cancelAnimationFrame(anim_request);
      clearTimeout(timeout);
    };
  }, [state]);

  if (!mounted) return null;
  return cloneElement(props.children, {
    className: `${props.children.props.className || ''} ${animationClass}`,
  });
};
export default ReactCSSTransition;
