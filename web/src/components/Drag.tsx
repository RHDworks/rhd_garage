import React, { useState, useEffect, useRef } from 'react';
import { PositionProps } from "../utils/interface";

const POSITION_STORAGE_KEY = 'garage_position';

export function useDraggable() {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [position, setPosition] = useState<PositionProps>({ x: 20, y: 20 });
    const [startPos, setStartPos] = useState<PositionProps>({ x: 0, y: 0 });

    const garageRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        try {
            const savedPosition = localStorage.getItem(POSITION_STORAGE_KEY);
            if (savedPosition) {
            setPosition(JSON.parse(savedPosition));
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
        } catch (error) {
            console.error('Error saving position to localStorage:', error);
        }
    }, [position]);

    
    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLButtonElement ||
            (e.target as HTMLElement).closest('button') !== null
        ) {
            return;
        }

        setIsDragging(true);
        setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        
        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;
        
        const maxX = window.innerWidth - (garageRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (garageRef.current?.offsetHeight || 0);
        
        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    };
    
    const onMouseUp = () => {
        setIsDragging(false);
    };
    
    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseMove = (e: MouseEvent) => {
                const newX = e.clientX - startPos.x;
                const newY = e.clientY - startPos.y;
                
                const maxX = window.innerWidth - (garageRef.current?.offsetWidth || 0);
                const maxY = window.innerHeight - (garageRef.current?.offsetHeight || 0);
                
                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY))
                });
            };
            
            const handleGlobalMouseUp = () => {
                setIsDragging(false);
            };
            
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [isDragging, startPos]);

    return {
        isDragging,
        position,
        garageRef,
        setIsDragging,
        setStartPos,
        onMouseDown,
        onMouseMove,
        onMouseUp
    };
}